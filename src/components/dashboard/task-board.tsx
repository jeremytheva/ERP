"use client";

import { useMemo } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { useGameState } from "@/hooks/use-game-data";
import { useTeamSettings } from "@/hooks/use-team-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role, Task, TaskPriority } from "@/types";

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  Critical: "bg-destructive text-destructive-foreground",
  High: "bg-red-500/90 text-white",
  Medium: "bg-amber-500/80 text-white",
  Low: "bg-emerald-500/80 text-white",
};

const roundMatches = (task: Task, round: number) => {
  if (task.roundRecurrence === "Continuous") {
    return (task.startRound ?? 1) <= round;
  }

  if (task.roundRecurrence === "RoundStart") {
    return (task.startRound ?? 1) <= round;
  }

  if (task.roundRecurrence === "Once") {
    return (task.startRound ?? 1) === round;
  }

  return true;
};

export function TaskBoard() {
  const { tasks } = useTasks();
  const { gameState } = useGameState();
  const { visibleRoles } = useTeamSettings();

  const currentRound = gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round || 1;

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => roundMatches(task, currentRound));
  }, [tasks, currentRound]);

  const tasksByRole = useMemo(() => {
    return visibleRoles.reduce<Partial<Record<Role, Task[]>>>((acc, role) => {
      acc[role] = filteredTasks.filter((task) => task.role === role);
      return acc;
    }, {});
  }, [filteredTasks, visibleRoles]);

  if (visibleRoles.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <ListChecks className="h-5 w-5" />
            Round {currentRound} Task Board
          </CardTitle>
          <CardDescription>
            Showing tasks for the currently selected roles in team settings.
          </CardDescription>
        </div>
        <Badge variant="outline" className="whitespace-nowrap text-xs font-semibold uppercase">
          {visibleRoles.length} Role{visibleRoles.length > 1 ? "s" : ""} Visible
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleRoles.map((role) => {
            const roleTasks = tasksByRole[role] ?? [];

            return (
              <div key={role} className="rounded-lg border bg-muted/40 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase text-muted-foreground">{role}</h3>
                  <Badge variant="secondary" className="text-[11px] font-medium">
                    {roleTasks.length} task{roleTasks.length === 1 ? "" : "s"}
                  </Badge>
                </div>
                <Separator className="my-3" />
                <div className="space-y-3">
                  {roleTasks.length > 0 ? (
                    roleTasks.map((task) => (
                      <div key={task.id} className="rounded-md border border-border bg-background p-3 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium leading-snug">{task.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{task.description}</p>
                          </div>
                          <Badge className={cn("text-[11px] font-semibold uppercase", PRIORITY_STYLES[task.priority])}>
                            {task.priority}
                          </Badge>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {task.estimatedTime} min
                          </span>
                          <span>{task.transactionCode}</span>
                          <span>
                            {task.roundRecurrence === "Continuous"
                              ? "Every round"
                              : task.roundRecurrence === "RoundStart"
                              ? "Round start"
                              : `Round ${task.startRound ?? currentRound}`}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No active tasks for this round.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
