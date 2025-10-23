
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { collection, doc, onSnapshot, writeBatch, FirestoreError } from "firebase/firestore";
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
      setTasks(ALL_TASKS); // Fallback to mock data if firestore is not available
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    
    const tasksColRef = collection(firestore, "tasks");

    const unsubscribe = onSnapshot(tasksColRef, async (querySnapshot) => {
        const firestoreTasks = querySnapshot.docs.map(doc => doc.data() as Task);
        const firestoreTaskIds = new Set(firestoreTasks.map(t => t.id));

        const missingTasks = ALL_TASKS.filter(mockTask => !firestoreTaskIds.has(mockTask.id));

        if (missingTasks.length > 0) {
            const batch = writeBatch(firestore);
            missingTasks.forEach(task => {
                const taskDocRef = doc(firestore, "tasks", task.id);
                batch.set(taskDocRef, task);
            });
            await batch.commit();
            // The onSnapshot listener will fire again with the updated data,
            // so we don't need to set state here immediately.
        } else {
            setTasks(firestoreTasks);
            setIsLoading(false);
        }
    },
    (error: FirestoreError) => {
        const contextualError = new FirestorePermissionError({
            path: 'tasks',
            operation: 'list',
        });
        errorEmitter.emit('permission-error', contextualError);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore]);

  const addTask = async (task: Task) => {
    if (!user || !firestore) return;
    const taskDocRef = doc(firestore, "tasks", task.id);
    const batch = writeBatch(firestore);
    batch.set(taskDocRef, task);
    await batch.commit();
  };

  const updateTask = async (updatedTask: Task) => {
    if (!user || !firestore) return;
    const taskDocRef = doc(firestore, "tasks", updatedTask.id);
    const batch = writeBatch(firestore);
    batch.update(taskDocRef, { ...updatedTask });
    await batch.commit();
  };

  const deleteTask = async (taskId: string) => {
    if (!user || !firestore) return;
    const taskDocRef = doc(firestore, "tasks", taskId);
    const batch = writeBatch(firestore);
    batch.delete(taskDocRef);
    await batch.commit();
  };
  
  const value = { tasks, addTask, updateTask, deleteTask };

  return (
    <TasksContext.Provider value={value}>
      {isLoading ? null : children}
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
