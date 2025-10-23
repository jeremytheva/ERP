
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { collection, doc, onSnapshot, writeBatch } from "firebase/firestore";
import { useFirestore } from "@/firebase";
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
    if (!user || !firestore) return;
    setIsLoading(true);
    
    const tasksColRef = collection(firestore, "tasks");

    const unsubscribe = onSnapshot(tasksColRef, async (querySnapshot) => {
      if (querySnapshot.empty) {
        // Initialize tasks if collection doesn't exist or is empty
        const batch = writeBatch(firestore);
        ALL_TASKS.forEach(task => {
          const taskDocRef = doc(firestore, "tasks", task.id);
          batch.set(taskDocRef, task);
        });
        await batch.commit();
        setTasks(ALL_TASKS);
      } else {
        const tasksData = querySnapshot.docs.map(doc => doc.data() as Task);
        setTasks(tasksData);
      }
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
