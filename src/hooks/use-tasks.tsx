
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { collection, doc, onSnapshot, writeBatch, FirestoreError, setDoc, deleteDoc, getDocs } from "firebase/firestore";
import { useFirestore, errorEmitter, FirestorePermissionError, useMemoFirebase } from "@/firebase";
import { useAuth as useAppContextAuth } from "./use-auth";
import type { Task } from "@/types";
import { ALL_TASKS } from "@/types/ALL_TASKS";

const sanitizeTask = (task: Task): Task =>
  JSON.parse(
    JSON.stringify(task, (_key, value) => {
      if (typeof value === "function") {
        return value.toString();
      }
      return value;
    })
  ) as Task;

const SERIALIZED_TASKS: Task[] = ALL_TASKS.map(sanitizeTask);

interface TasksContextType {
  tasks: Task[];
  addTask: (task: Task) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAppContextAuth();
  const firestore = useFirestore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const tasksColRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, "tasks");
  }, [user, firestore]);

  useEffect(() => {
    if (!tasksColRef) {
      setTasks([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);

    const unsubscribe = onSnapshot(tasksColRef, async (querySnapshot) => {
      if (querySnapshot.empty) {
        // Seed the database if it's empty
        console.log("No tasks found, seeding database with new strategic tasks...");
        const batch = writeBatch(firestore);
        SERIALIZED_TASKS.forEach((task) => {
          const taskDocRef = doc(firestore, "tasks", task.id);
          batch.set(taskDocRef, task);
        });
        await batch.commit().then(() => {
            setTasks(SERIALIZED_TASKS);
            setIsLoading(false);
        }).catch(error => {
          const contextualError = new FirestorePermissionError({
            path: 'tasks',
            operation: 'write',
          });
          errorEmitter.emit('permission-error', contextualError);
          setIsLoading(false);
        });
      } else {
        const dbTasks = querySnapshot.docs.map(doc => doc.data() as Task);
        // Basic reconciliation: if the number of tasks differs, re-seed.
        // A more robust solution would be to diff the tasks.
        if (dbTasks.length !== SERIALIZED_TASKS.length) {
            console.log("Task mismatch detected, re-seeding database...");
             const batch = writeBatch(firestore);
            // First, delete existing tasks
            const existingTasksSnapshot = await getDocs(tasksColRef);
            existingTasksSnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            // Then, add the new tasks
            SERIALIZED_TASKS.forEach((task) => {
              const taskDocRef = doc(firestore, "tasks", task.id);
              batch.set(taskDocRef, task);
            });
            await batch.commit();
            setTasks(SERIALIZED_TASKS);
        } else {
             setTasks(dbTasks);
        }
        setIsLoading(false);
      }
    },
    (error: FirestoreError) => {
        const contextualError = new FirestorePermissionError({
            path: 'tasks',
            operation: 'list',
        });
        errorEmitter.emit('permission-error', contextualError);
        setTasks([]); // Fallback to empty array on error
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [tasksColRef, firestore]);

  const addTask = async (task: Task) => {
    if (!firestore) return;
    const taskDocRef = doc(firestore, "tasks", task.id);
    await setDoc(taskDocRef, task).catch(error => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `tasks/${task.id}`, operation: 'create', requestResourceData: task }));
    });
  };

  const updateTask = async (updatedTask: Task) => {
    if (!firestore) return;
    const taskDocRef = doc(firestore, "tasks", updatedTask.id);
    await setDoc(taskDocRef, updatedTask, { merge: true }).catch(error => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `tasks/${updatedTask.id}`, operation: 'update', requestResourceData: updatedTask }));
    });
  };

  const deleteTask = async (taskId: string) => {
    if (!firestore) return;
    const taskDocRef = doc(firestore, "tasks", taskId);
    await deleteDoc(taskDocRef).catch(error => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `tasks/${taskId}`, operation: 'delete' }));
    });
  };
  
  const value = { tasks, addTask, updateTask, deleteTask };

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return context;
};
