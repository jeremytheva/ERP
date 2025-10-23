
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
  const [tasks, setTasks] = useState<Task[]>(ALL_TASKS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // We are now treating the mock-data.ts as the source of truth for tasks.
    // The logic to sync from mock to firestore has been removed for simplicity
    // and to ensure all defined tasks are always available.
    setTasks(ALL_TASKS);
  }, []);

  const addTask = async (task: Task) => {
    // This now updates the local state. A real implementation would write to a DB.
    setTasks(prevTasks => [...prevTasks, task]);
  };

  const updateTask = async (updatedTask: Task) => {
     // This now updates the local state. A real implementation would write to a DB.
    setTasks(prevTasks => prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  const deleteTask = async (taskId: string) => {
    // This now updates the local state. A real implementation would write to a DB.
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
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
