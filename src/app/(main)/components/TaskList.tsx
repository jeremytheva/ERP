"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { GoalTracker } from "./GoalTracker";
import type { UiTask, KpiValues } from "./types";

interface TaskListProps {
  tasks: UiTask[];
  progress: Record<string, boolean>;
  onToggleTask: (taskId: string, completed: boolean) => void;
  selectedRoles: string[];
  currentRound: number;
  kpiValues: KpiValues;
}

const priorityStyles: Record<string, string> = {
  Critical: "bg-rose-500/10 text-rose-500",
  High: "bg-amber-500/10 text-amber-500",
  Medium: "bg-sky-500/10 text-sky-500",
  Low: "bg-emerald-500/10 text-emerald-500",
};

export function TaskList({ tasks, progress, onToggleTask, selectedRoles, currentRound, kpiValues }: TaskListProps) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur">
      <header className="flex flex-col gap-1">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Step 4</p>
        <h2 className="font-headline text-2xl">Work the guided task queue</h2>
        <p className="text-sm text-muted-foreground">
          Tasks update automatically based on the selected roles and round. Mark them complete as your team progresses.
        </p>
      </header>

      {tasks.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          {selectedRoles.length === 0 ? (
            <span>Select at least one role to begin.</span>
          ) : (
            <span>No tasks for Round {currentRound} with the chosen roles. Advance a round or broaden your role selection.</span>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const completed = progress[task.id] ?? task.completed;
            const priorityStyle = priorityStyles[task.priority] ?? "bg-muted text-muted-foreground";
            return (
              <article
                key={task.id}
                className={`rounded-lg border border-border/80 bg-background/70 p-4 shadow-sm transition hover:border-primary/60 ${
                  completed ? "opacity-70" : ""
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={completed}
                      onCheckedChange={(checked) => onToggleTask(task.id, checked === true)}
                      className="mt-1"
                    />
                    <div>
                      <h3 className="font-semibold text-lg leading-tight">{task.title}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="bg-muted/50 capitalize">
                          {task.role}
                        </Badge>
                        <Badge className={priorityStyle}>{task.priority}</Badge>
                        {task.transactionCode && (
                          <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide">
                            {task.transactionCode}
                          </span>
                        )}
                        <span>Estimated {task.estimatedTime} min</span>
                        {task.round && <span>Round {task.round}</span>}
                      </div>
                      {task.description && (
                        <p className="mt-2 text-sm text-muted-foreground/90">{task.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right text-xs text-muted-foreground">
                    {task.dependencyIDs?.length > 0 && (
                      <span>Depends on: {task.dependencyIDs.join(", ")}</span>
                    )}
                    {task.roundRecurrence && <span>Recurs: {task.roundRecurrence}</span>}
                  </div>
                </div>
                <GoalTracker task={task} kpiValues={kpiValues} />
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
