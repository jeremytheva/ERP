"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import type { Task } from "@/types";
import { ALL_TASKS } from "@/lib/mock-data";

interface TasksContextType {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem("allTasks");
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      } else {
        setTasks(ALL_TASKS);
      }
    } catch (error) {
      console.error("Failed to parse tasks from localStorage", error);
      setTasks(ALL_TASKS);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
       localStorage.setItem("allTasks", JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const addTask = (task: Task) => {
    setTasks((prev) => [...prev, task]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
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
