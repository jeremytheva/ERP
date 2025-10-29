"use client";

import { useState, useEffect, useMemo, useCallback, createContext, useContext, ReactNode } from "react";
import { collection, doc, onSnapshot, writeBatch, FirestoreError, setDoc, deleteDoc } from "firebase/firestore";
import { useFirestore, errorEmitter, FirestorePermissionError, useMemoFirebase } from "@/firebase";
import { useAuth as useAppContextAuth } from "./use-auth";
import { useGameState } from "./use-game-data";
import type { Alerts, GameState, Role, Task } from "@/types";
import { ALL_TASKS } from "@/data/tasks-v2";

type RoleFilter = "All" | Role;

interface TasksContextType {
  tasks: Task[];
  allTasks: Task[];
  alerts: Alerts;
  roleFilter: RoleFilter;
  setRoleFilter: (filter: RoleFilter) => void;
  isLoading: boolean;
  addTask: (task: Task) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

const hideLegacy = (task: Task) => {
  const segments = task.id.split(".");
  if (segments.length > 1) {
    return segments[segments.length - 1] === "2";
  }
  return true;
};

const deriveAlerts = (gameState: GameState): Alerts => {
  const cashLow = gameState.cashBalance < 100_000;
  const rmShortage = gameState.inventoryValue < 125_000;
  const dcStockout = gameState.marketShare < 0.2 && gameState.inventoryTurnover > 6;
  const mrpIssues = gameState.capacityUtilization < 0.65;
  const co2OverTarget = gameState.cumulativeCO2eEmissions > 250_000;
  const backlog = gameState.onTimeDeliveryRate < 0.9;

  return {
    cashLow,
    rmShortage,
    dcStockout,
    mrpIssues,
    co2OverTarget,
    backlog,
  };
};

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAppContextAuth();
  const firestore = useFirestore();
  const { gameState } = useGameState();
  const [rawTasks, setRawTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");

  const tasksColRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, "tasks");
  }, [user, firestore]);

  useEffect(() => {
    if (!tasksColRef || !firestore) {
      setRawTasks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribe = onSnapshot(
      tasksColRef,
      async (querySnapshot) => {
        if (querySnapshot.empty) {
          const batch = writeBatch(firestore);
          ALL_TASKS.forEach((task) => {
            const taskDocRef = doc(firestore, "tasks", task.id);
            batch.set(taskDocRef, task, { merge: true });
          });

          try {
            await batch.commit();
            setRawTasks(ALL_TASKS);
          } catch (error) {
            const contextualError = new FirestorePermissionError({
              path: "tasks",
              operation: "write",
            });
            errorEmitter.emit("permission-error", contextualError);
          } finally {
            setIsLoading(false);
          }
          return;
        }

        const dbTasks = querySnapshot.docs.map((document) => document.data() as Task);
        setRawTasks(dbTasks);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        const contextualError = new FirestorePermissionError({
          path: "tasks",
          operation: "list",
        });
        errorEmitter.emit("permission-error", contextualError);
        setRawTasks([]);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [tasksColRef, firestore]);

  const alerts = useMemo(() => deriveAlerts(gameState), [gameState]);

  const allTasks = useMemo(() => rawTasks.filter(hideLegacy), [rawTasks]);

  const alertFilteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      if (task.visibility === "OnAlert" && task.alertKey) {
        return Boolean(alerts[task.alertKey]);
      }
      return true;
    });
  }, [allTasks, alerts]);

  const visibleTasks = useMemo(() => {
    if (roleFilter === "All") {
      return alertFilteredTasks;
    }
    return alertFilteredTasks.filter((task) => task.role === roleFilter);
  }, [alertFilteredTasks, roleFilter]);

  const addTask = useCallback(
    async (task: Task) => {
      if (!firestore) return;
      const taskDocRef = doc(firestore, "tasks", task.id);
      try {
        await setDoc(taskDocRef, task, { merge: true });
      } catch (error) {
        errorEmitter.emit(
          "permission-error",
          new FirestorePermissionError({
            path: `tasks/${task.id}`,
            operation: "create",
            requestResourceData: task,
          })
        );
      }
    },
    [firestore]
  );

  const updateTask = useCallback(
    async (task: Task) => {
      if (!firestore) return;
      const taskDocRef = doc(firestore, "tasks", task.id);
      try {
        await setDoc(taskDocRef, task, { merge: true });
      } catch (error) {
        errorEmitter.emit(
          "permission-error",
          new FirestorePermissionError({
            path: `tasks/${task.id}`,
            operation: "update",
            requestResourceData: task,
          })
        );
      }
    },
    [firestore]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!firestore) return;
      const taskDocRef = doc(firestore, "tasks", taskId);
      try {
        await deleteDoc(taskDocRef);
      } catch (error) {
        errorEmitter.emit(
          "permission-error",
          new FirestorePermissionError({
            path: `tasks/${taskId}`,
            operation: "delete",
          })
        );
      }
    },
    [firestore]
  );

  const value = useMemo(
    () => ({
      tasks: visibleTasks,
      allTasks,
      alerts,
      roleFilter,
      setRoleFilter,
      isLoading,
      addTask,
      updateTask,
      deleteTask,
    }),
    [visibleTasks, allTasks, alerts, roleFilter, isLoading, addTask, updateTask, deleteTask]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return context;
};
