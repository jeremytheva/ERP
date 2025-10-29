
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { collection, doc, onSnapshot, writeBatch, FirestoreError, setDoc, deleteDoc, getDocs } from "firebase/firestore";
import { useFirestore, errorEmitter, FirestorePermissionError, useMemoFirebase } from "@/firebase";
import { ALL_TASKS } from "@/data/tasks";
import { useAuth as useAppContextAuth } from "./use-auth";
import type { Task } from "@/types";



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
  const [, setIsLoading] = useState(true);

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

    const emitListError = () => {
      errorEmitter.emit(
        "permission-error",
        new FirestorePermissionError({
          path: "tasks",
          operation: "list",
        }),
      );
    };

    const emitSeedError = () => {
      errorEmitter.emit(
        "permission-error",
        new FirestorePermissionError({
          path: "tasks",
          operation: "write",
        }),
      );
    };

    const seedTasksInFirestore = async (replaceExisting = false) => {
      if (!firestore || !tasksColRef) return;

      const batch = writeBatch(firestore);

      if (replaceExisting) {
        const existingTasksSnapshot = await getDocs(tasksColRef);
        existingTasksSnapshot.forEach((docSnapshot) => {
          batch.delete(docSnapshot.ref);
        });
      }

      ALL_TASKS.forEach((task) => {
        batch.set(doc(firestore, "tasks", task.id), task);
      });

      await batch.commit();
      setTasks(ALL_TASKS);
    };

    const unsubscribe = onSnapshot(
      tasksColRef,
      async (querySnapshot) => {
        if (querySnapshot.empty) {
          console.log("No tasks found, seeding database with new strategic tasks...");
          try {
            await seedTasksInFirestore();
          } catch (error) {
            emitSeedError();
          } finally {
            setIsLoading(false);
          }
          return;
        }

        const dbTasks = querySnapshot.docs.map((docSnapshot) => docSnapshot.data() as Task);

        if (dbTasks.length !== ALL_TASKS.length) {
          console.log("Task mismatch detected, re-seeding database...");
          try {
            await seedTasksInFirestore(true);
          } catch (error) {
            emitSeedError();
          } finally {
            setIsLoading(false);
          }
          return;
        }

        setTasks(dbTasks);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        console.error("Error fetching tasks snapshot", error);
        emitListError();
        setTasks([]); // Fallback to empty array on error
        setIsLoading(false);
      },
    );

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
