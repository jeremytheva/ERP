
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { collection, doc, onSnapshot, writeBatch, FirestoreError, setDoc, deleteDoc, getDocs } from "firebase/firestore";
import { useFirestore, errorEmitter, FirestorePermissionError } from "@/firebase";
import { useAuth } from "./use-auth";
import type { Task } from "@/types";
import { ALL_TASKS } from "@/lib/mock-data";

interface TasksContextType {
  tasks: Task[];
  addTask: (task: Task) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const firestore = useFirestore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !firestore) {
      setTasks([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    const tasksColRef = collection(firestore, "tasks");

    const unsubscribe = onSnapshot(tasksColRef, async (querySnapshot) => {
      if (querySnapshot.empty) {
        // Seed the database if it's empty
        console.log("No tasks found, seeding database...");
        const batch = writeBatch(firestore);
        ALL_TASKS.forEach((task) => {
          const taskDocRef = doc(firestore, "tasks", task.id);
          batch.set(taskDocRef, task);
        });
        await batch.commit().catch(error => {
          const contextualError = new FirestorePermissionError({
            path: 'tasks',
            operation: 'write',
          });
          errorEmitter.emit('permission-error', contextualError);
        });
        // The snapshot listener will pick up the newly added tasks.
      } else {
        const dbTasks = querySnapshot.docs.map(doc => doc.data() as Task);
        setTasks(dbTasks);
      }
      setIsLoading(false);
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
  }, [user, firestore]);

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
