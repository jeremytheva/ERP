import type { Task } from "@/types";

export type TaskDueStatus = "overdue" | "due" | "upcoming" | "blocked" | "completed";

const STATUS_ORDER: Record<TaskDueStatus, number> = {
  overdue: 0,
  due: 1,
  blocked: 2,
  upcoming: 3,
  completed: 4,
};

export interface TaskStatusMeta {
  status: TaskDueStatus;
  label: string;
  startRound: number;
  dependenciesMet: boolean;
  isRepeatable: boolean;
}

export const compareTaskStatus = (a: TaskDueStatus, b: TaskDueStatus) => STATUS_ORDER[a] - STATUS_ORDER[b];

const getDependencies = (task: Task, allTasks: Task[]) =>
  task.dependencyIDs
    .map((depId) => allTasks.find((t) => t.id === depId))
    .filter(Boolean) as Task[];

export const getTaskStatusMeta = (task: Task, allTasks: Task[], currentRound: number): TaskStatusMeta => {
  const startRound = task.startRound ?? 1;
  const dependencies = getDependencies(task, allTasks);
  const dependenciesMet = dependencies.length === 0 || dependencies.every((dep) => dep.completed);
  const isRepeatable = task.roundRecurrence === "RoundStart" || task.roundRecurrence === "Continuous";

  if (task.completed) {
    return { status: "completed", label: "Completed", startRound, dependenciesMet, isRepeatable };
  }

  if (!dependenciesMet) {
    return { status: "blocked", label: "Blocked", startRound, dependenciesMet, isRepeatable };
  }

  if (startRound > currentRound) {
    return { status: "upcoming", label: `Upcoming (Round ${startRound})`, startRound, dependenciesMet, isRepeatable };
  }

  if (!isRepeatable && startRound < currentRound) {
    return { status: "overdue", label: "Overdue", startRound, dependenciesMet, isRepeatable };
  }

  return { status: "due", label: isRepeatable ? "Due This Round" : "Due Now", startRound, dependenciesMet, isRepeatable };
};

export interface CategorizedTasks {
  status: TaskDueStatus;
  tasks: Task[];
}

export const categorizeTasks = (tasks: Task[], allTasks: Task[], currentRound: number): CategorizedTasks[] => {
  const buckets: Record<TaskDueStatus, Task[]> = {
    overdue: [],
    due: [],
    blocked: [],
    upcoming: [],
    completed: [],
  };

  tasks.forEach((task) => {
    const { status } = getTaskStatusMeta(task, allTasks, currentRound);
    buckets[status].push(task);
  });

  return (Object.keys(buckets) as TaskDueStatus[])
    .map((status) => ({ status, tasks: buckets[status] }))
    .filter((bucket) => bucket.tasks.length > 0)
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
};

export interface TaskSummary {
  total: number;
  overdue: number;
  due: number;
  blocked: number;
  upcoming: number;
  completed: number;
}

export const summarizeTasks = (tasks: Task[], allTasks: Task[], currentRound: number): TaskSummary => {
  const summary: TaskSummary = {
    total: tasks.length,
    overdue: 0,
    due: 0,
    blocked: 0,
    upcoming: 0,
    completed: 0,
  };

  tasks.forEach((task) => {
    const { status } = getTaskStatusMeta(task, allTasks, currentRound);
    summary[status] += 1;
  });

  return summary;
};
