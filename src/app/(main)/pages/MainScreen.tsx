"use client";

import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import type { Role } from "@/types";
import { RoleSelector } from "../components/RoleSelector";
import { RoundControl } from "../components/RoundControl";
import { TaskList } from "../components/TaskList";
import { DataEntryPanel } from "../components/DataEntryPanel";
import type { KpiValues, UiTask } from "../components/types";
import { ALL_TASKS_FULL_V4 } from "../master-data/ALL_TASKS_full_v4";
import type { Task as MasterTask } from "../master-data/types";
import { useTasks } from "@/hooks/use-tasks";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const MAX_ROUNDS = 8;

type ProgressMap = Record<string, boolean>;

type PersistentUpdater<T> = Dispatch<SetStateAction<T>>;

function usePersistentState<T>(key: string, defaultValue: T): [T, PersistentUpdater<T>] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = window.localStorage.getItem(key);
      if (stored === null) return defaultValue;
      return JSON.parse(stored) as T;
    } catch (error) {
      console.warn(`Failed to read localStorage key "${key}"`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Failed to persist localStorage key "${key}"`, error);
    }
  }, [key, state]);

  return [state, setState];
}

function extractFormulaFields(formula?: string | null): string[] {
  if (!formula) return [];
  const match = formula.match(/\(\s*\{([^}]*)\}\s*\)=>/);
  if (!match) return [];
  return match[1]
    .split(",")
    .map((segment) => segment.split("=")[0].split(":")[0].trim())
    .filter(Boolean);
}

const priorityOrder: Record<string, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

export default function MainScreen() {
  const { tasks: remoteTasks, updateTask, addTask } = useTasks();

  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [currentRound, setCurrentRound] = usePersistentState<number>("erpsim-round", 1);
  const [kpiValues, setKpiValues] = usePersistentState<KpiValues>("erpsim-kpis", {} as KpiValues);
  const [localProgress, setLocalProgress] = usePersistentState<ProgressMap>("erpsim-progress", {});
  const [theme, setTheme] = usePersistentState<"light" | "dark">("erpsim-theme", "dark");
  const [useRemoteSync, setUseRemoteSync] = useState(false);

  const baseTasks = useMemo<UiTask[]>(() => {
    return (ALL_TASKS_FULL_V4 as MasterTask[]).map((task) => ({
      ...task,
      requiredFields: extractFormulaFields(task.goalCalculation?.formula),
    }));
  }, []);

  const allRoles = useMemo(() => {
    return Array.from(new Set(baseTasks.map((task) => task.role))) as Role[];
  }, [baseTasks]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
  }, [theme]);

  const datasetIds = useMemo(() => baseTasks.map((task) => task.id), [baseTasks]);
  const datasetIdSet = useMemo(() => new Set(datasetIds), [datasetIds]);

  const remoteAvailable = remoteTasks.length > 0;

  const remoteProgress = useMemo(() => {
    const entries: [string, boolean][] = remoteTasks
      .filter((task) => datasetIdSet.has(task.id))
      .map((task) => [task.id, Boolean(task.completed)]);
    return Object.fromEntries(entries) as ProgressMap;
  }, [remoteTasks, datasetIdSet]);

  useEffect(() => {
    if (!useRemoteSync || !remoteAvailable) {
      return;
    }
    const remoteTaskIds = new Set(remoteTasks.map((task) => task.id));
    const missingTasks = baseTasks.filter((task) => !remoteTaskIds.has(task.id));
    if (missingTasks.length === 0) {
      return;
    }
    missingTasks.forEach((task) => {
      void addTask(task);
    });
  }, [useRemoteSync, remoteAvailable, baseTasks, remoteTasks, addTask]);

  useEffect(() => {
    if (!useRemoteSync) return;
    if (Object.keys(remoteProgress).length === 0) return;
    setLocalProgress((previous) => {
      const merged = { ...previous };
      let changed = false;
      Object.entries(remoteProgress).forEach(([id, completed]) => {
        if (merged[id] !== completed) {
          merged[id] = completed;
          changed = true;
        }
      });
      return changed ? merged : previous;
    });
  }, [useRemoteSync, remoteProgress, setLocalProgress]);

  const effectiveProgress = useMemo(() => {
    if (!useRemoteSync) {
      return localProgress;
    }
    return { ...localProgress, ...remoteProgress };
  }, [useRemoteSync, localProgress, remoteProgress]);

  const effectiveRoles = selectedRoles.includes("Team Leader") ? allRoles : selectedRoles;

  const visibleTasks = useMemo(() => {
    if (effectiveRoles.length === 0) {
      return [];
    }
    return baseTasks
      .filter((task) => {
        const roleMatch = effectiveRoles.includes(task.role as Role);
        const roundMatch = (task.round ?? task.startRound ?? currentRound) === currentRound;
        return roleMatch && roundMatch;
      })
      .sort((a, b) => {
        const priorityComparison = (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99);
        if (priorityComparison !== 0) return priorityComparison;
        return (a.estimatedTime ?? 0) - (b.estimatedTime ?? 0);
      });
  }, [effectiveRoles, baseTasks, currentRound]);

  const activeFields = useMemo(() => {
    const fieldSet = new Set<string>();
    visibleTasks.forEach((task) => {
      task.requiredFields.forEach((field) => {
        if (field) fieldSet.add(field);
      });
    });
    return Array.from(fieldSet).sort((a, b) => a.localeCompare(b));
  }, [visibleTasks]);

  const handleUpdateKpi = useCallback(
    (field: string, value: number | undefined) => {
      setKpiValues((previous) => {
        const next = { ...previous } as KpiValues;
        if (value === undefined) {
          if (field in next) {
            delete next[field as keyof KpiValues];
            return next;
          }
          return previous;
        }
        if (next[field] === value) {
          return previous;
        }
        next[field] = value;
        return next;
      });
    },
    [setKpiValues]
  );

  const handleClearKpis = useCallback(() => {
    if (activeFields.length === 0) return;
    setKpiValues((previous) => {
      const next = { ...previous } as KpiValues;
      let changed = false;
      activeFields.forEach((field) => {
        if (field in next) {
          delete next[field as keyof KpiValues];
          changed = true;
        }
      });
      return changed ? next : previous;
    });
  }, [activeFields, setKpiValues]);

  const handleToggleTask = useCallback(
    (taskId: string, completed: boolean) => {
      setLocalProgress((previous) => {
        if (previous[taskId] === completed) {
          return previous;
        }
        return { ...previous, [taskId]: completed };
      });

      if (!useRemoteSync || !remoteAvailable) {
        return;
      }

      const remoteTask = remoteTasks.find((task) => task.id === taskId);
      if (remoteTask) {
        void updateTask({ ...remoteTask, completed });
      } else {
        const datasetTask = baseTasks.find((task) => task.id === taskId);
        if (datasetTask) {
          void addTask({ ...datasetTask, completed });
        }
      }
    },
    [setLocalProgress, useRemoteSync, remoteAvailable, remoteTasks, updateTask, baseTasks, addTask]
  );

  const handleRoundChange = useCallback(
    (round: number) => {
      const clamped = Math.min(Math.max(round, 1), MAX_ROUNDS);
      setCurrentRound(clamped);
    },
    [setCurrentRound]
  );

  const handleThemeToggle = useCallback(
    (checked: boolean) => {
      setTheme(checked ? "dark" : "light");
    },
    [setTheme]
  );

  const handleRemoteToggle = useCallback(
    (checked: boolean) => {
      if (!remoteAvailable && checked) {
        return;
      }
      setUseRemoteSync(checked);
    },
    [remoteAvailable]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40 pb-16 text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-10 sm:px-6 lg:px-10">
        <header className="flex flex-col gap-6 rounded-xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-emerald-500">ERPsim Companion</p>
              <h1 className="font-headline text-3xl leading-tight md:text-4xl">Guided team console</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Stay on a single screen to choose roles, review round-specific priorities, track KPIs, and advance gameplay without switching tabs.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/70 px-3 py-2 text-sm shadow-sm">
                <Switch checked={theme === "dark"} onCheckedChange={handleThemeToggle} />
                <div className="flex flex-col">
                  <span className="font-medium">Dark mode</span>
                  <span className="text-xs text-muted-foreground">Toggle for classroom lighting conditions.</span>
                </div>
              </div>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm shadow-sm",
                  useRemoteSync ? "border-emerald-500/60 bg-emerald-500/10" : "border-border/60 bg-background/70"
                )}
              >
                <Switch checked={useRemoteSync} disabled={!remoteAvailable} onCheckedChange={handleRemoteToggle} />
                <div className="flex flex-col">
                  <span className="font-medium">Firestore sync</span>
                  <span className="text-xs text-muted-foreground">
                    {remoteAvailable ? "Optional cloud save for team progress." : "Unavailable — working from local state."}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <Separator className="bg-border/60" />
          <p className="text-xs text-muted-foreground">
            Progress automatically persists locally. Enable Firestore sync when your classroom deployment is connected.
          </p>
        </header>

        <RoleSelector roles={allRoles} selectedRoles={selectedRoles} onChange={setSelectedRoles} />

        {selectedRoles.length > 0 && (
          <div className="flex flex-col gap-6">
            <RoundControl currentRound={currentRound} maxRound={MAX_ROUNDS} onRoundChange={handleRoundChange} />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <TaskList
                tasks={visibleTasks}
                progress={effectiveProgress}
                onToggleTask={handleToggleTask}
                selectedRoles={selectedRoles}
                currentRound={currentRound}
                kpiValues={kpiValues}
              />
              <DataEntryPanel fields={activeFields} kpiValues={kpiValues} onUpdateValue={handleUpdateKpi} onClearAll={handleClearKpis} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
