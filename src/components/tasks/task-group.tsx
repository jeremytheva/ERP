"use client";

import { useMemo, type RefObject, type ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";
import {
  categorizeTasks,
  summarizeTasks,
  type TaskDueStatus,
} from "@/lib/task-utils";
import { InteractiveTaskCard } from "./interactive-task-card";

interface TaskGroupProps {
  title: string;
  description?: string;
  tasks: Task[];
  allTasks: Task[];
  currentRound: number;
  openedTaskId: string | null;
  setOpenedTaskId: (id: string | null) => void;
  activeTaskId: string | null;
  getTaskRef: (taskId: string) => RefObject<HTMLDivElement>;
  onUpdate: (task: Task) => void;
  onFindNext: (taskId: string, taskGroup: Task[]) => void;
  titleIcon?: ReactNode;
}

const SUMMARY_CARD_STYLES: Record<string, string> = {
  total: "border-border bg-muted/40",
  due: "border-primary/20 bg-primary/5",
  overdue: "border-destructive/20 bg-destructive/10",
  blocked: "border-amber-500/20 bg-amber-500/10",
  upcoming: "border-border bg-muted/10",
  completed: "border-emerald-500/20 bg-emerald-500/10",
};

const STATUS_COPY: Record<TaskDueStatus, { title: string; description: string }> = {
  overdue: {
    title: "Overdue",
    description: "Tasks from earlier rounds that still need attention.",
  },
  due: {
    title: "Due Now",
    description: "Ready to work this round once dependencies are cleared.",
  },
  blocked: {
    title: "Blocked",
    description: "Waiting on prerequisite tasks before you can proceed.",
  },
  upcoming: {
    title: "Upcoming",
    description: "Scheduled for a later round—plan ahead now.",
  },
  completed: {
    title: "Completed",
    description: "Finished tasks for historical context.",
  },
};

export function TaskGroup({
  title,
  description,
  tasks,
  allTasks,
  currentRound,
  openedTaskId,
  setOpenedTaskId,
  activeTaskId,
  getTaskRef,
  onUpdate,
  onFindNext,
  titleIcon,
}: TaskGroupProps) {
  const summary = useMemo(
    () => summarizeTasks(tasks, allTasks, currentRound),
    [tasks, allTasks, currentRound]
  );

  const sections = useMemo(
    () => categorizeTasks(tasks, allTasks, currentRound),
    [tasks, allTasks, currentRound]
  );

  if (tasks.length === 0) {
    return null;
  }

  const summaryItems = [
    { key: "total", label: "Total Tasks", value: summary.total, note: "In this track" },
    { key: "due", label: "Due Now", value: summary.due, note: "Ready to work" },
    { key: "overdue", label: "Overdue", value: summary.overdue, note: "Need immediate follow-up" },
    { key: "blocked", label: "Blocked", value: summary.blocked, note: "Waiting on prerequisites" },
    { key: "upcoming", label: "Upcoming", value: summary.upcoming, note: "Scheduled for later" },
    { key: "completed", label: "Completed", value: summary.completed, note: "Already wrapped" },
  ];

  return (
    <Card>
      <CardHeader>
        {titleIcon ? (
          <div className="flex items-start gap-3">
            <div className="text-muted-foreground">{titleIcon}</div>
            <div>
              <CardTitle>{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
          </div>
        ) : (
          <>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
          <div className="space-y-3">
            {summaryItems.map(({ key, label, value, note }) => (
              <div
                key={key}
                className={cn(
                  "rounded-lg border p-4",
                  SUMMARY_CARD_STYLES[key] ?? SUMMARY_CARD_STYLES.total,
                  value === 0 && "opacity-60"
                )}
              >
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-semibold">{value}</p>
                <p className="text-xs text-muted-foreground">{note}</p>
              </div>
            ))}
          </div>
          <div className="space-y-8">
            {sections.map(({ status, tasks: sectionTasks }) => (
              <div key={status} className="space-y-4">
                <div>
                  <p className="text-sm font-semibold tracking-wide text-muted-foreground">
                    {STATUS_COPY[status].title}
                    <span className="ml-2 text-xs font-normal text-muted-foreground/80">
                      ({sectionTasks.length})
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">{STATUS_COPY[status].description}</p>
                </div>
                <div className="space-y-4">
                  {sectionTasks.map((task) => (
                    <div key={task.id} className="relative pt-6">
                      <InteractiveTaskCard
                        ref={getTaskRef(task.id)}
                        task={task}
                        allTasks={allTasks}
                        isActive={openedTaskId === task.id}
                        isCurrent={activeTaskId === task.id}
                        onToggle={() =>
                          setOpenedTaskId(openedTaskId === task.id ? null : task.id)
                        }
                        onUpdate={onUpdate}
                        onFindNext={(id) => onFindNext(id, tasks)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
