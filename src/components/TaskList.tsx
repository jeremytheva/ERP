"use client";

import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useTasks } from "@/hooks/use-tasks";
import { useGameState } from "@/hooks/use-game-data";
import type { Role, Task, GameState } from "@/types";
import { Circle, CheckCircle2, Target, ClipboardList } from "lucide-react";

const ROLE_ORDER: Role[] = ["Team Leader", "Sales", "Production", "Procurement", "Logistics"];

const PRIORITY_LABEL: Record<Task["priority"], string> = {
  Critical: "Critical",
  High: "High",
  Medium: "Medium",
  Low: "Low",
};

const PRIORITY_VARIANT: Record<Task["priority"], "destructive" | "default" | "secondary" | "outline"> = {
  Critical: "destructive",
  High: "default",
  Medium: "secondary",
  Low: "outline",
};

type GoalDefinition = {
  metric: keyof GameState;
  comparison: "gte" | "lte";
  threshold: number;
  format: "currency" | "number" | "percent";
  label: string;
  helper?: string;
};

const TASK_GOALS: Partial<Record<string, GoalDefinition>> = {
  "TL-1": {
    metric: "grossMargin",
    comparison: "gte",
    threshold: 0.2,
    format: "percent",
    label: "Gross margin ≥ 20%",
    helper: "Ensure profitability before approving pricing moves.",
  },
  "TL-2": {
    metric: "cashBalance",
    comparison: "gte",
    threshold: 200000,
    format: "currency",
    label: "Maintain €200k cash runway",
  },
  "TL-4": {
    metric: "netIncome",
    comparison: "gte",
    threshold: 0,
    format: "currency",
    label: "Positive net income",
  },
  "S-1": {
    metric: "marketShare",
    comparison: "gte",
    threshold: 0.15,
    format: "percent",
    label: "Market share ≥ 15%",
  },
  "S-2": {
    metric: "inventoryTurnover",
    comparison: "gte",
    threshold: 4,
    format: "number",
    label: "Inventory turnover ≥ 4x",
  },
  "PM-1": {
    metric: "capacityUtilization",
    comparison: "gte",
    threshold: 0.85,
    format: "percent",
    label: "Utilisation ≥ 85%",
  },
  "PM-3": {
    metric: "cogs",
    comparison: "lte",
    threshold: 3000000,
    format: "currency",
    label: "COGS within €3M",
  },
  "P-4": {
    metric: "cumulativeCO2eEmissions",
    comparison: "lte",
    threshold: 120000,
    format: "number",
    label: "CO₂e ≤ 120k kg",
  },
  "L-2": {
    metric: "warehouseCosts",
    comparison: "lte",
    threshold: 150000,
    format: "currency",
    label: "Warehouse cost ≤ €150k",
  },
};

const formatValue = (value: number, format: GoalDefinition["format"]) => {
  if (Number.isNaN(value)) return "–";
  if (format === "currency") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      notation: "compact",
      compactDisplay: "short",
    }).format(value);
  }
  if (format === "percent") {
    const normalised = value > 1 ? value / 100 : value;
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(normalised);
  }
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value);
};

const evaluateGoal = (goal: GoalDefinition, state: GameState) => {
  const candidate = state[goal.metric];
  const numericValue = typeof candidate === "number" ? candidate : 0;
  const normalisedValue = goal.format === "percent" && numericValue > 1 ? numericValue / 100 : numericValue;
  const normalisedThreshold = goal.format === "percent" && goal.threshold > 1 ? goal.threshold / 100 : goal.threshold;
  const met = goal.comparison === "gte" ? normalisedValue >= normalisedThreshold : normalisedValue <= normalisedThreshold;

  return {
    met,
    currentFormatted: formatValue(goal.format === "percent" ? normalisedValue : numericValue, goal.format),
    targetFormatted: formatValue(goal.format === "percent" ? normalisedThreshold : goal.threshold, goal.format),
    label: goal.label,
    helper: goal.helper,
  };
};

const isTaskActiveForRound = (task: Task, currentRound: number) => {
  if (task.roundRecurrence === "Continuous") return true;
  const startRound = task.startRound ?? 1;
  if (task.roundRecurrence === "RoundStart") {
    return startRound <= currentRound;
  }
  if (task.roundRecurrence === "Once") {
    return startRound === currentRound;
  }
  return true;
};

const roleHeading = (role: Role, totalTasks: number) => {
  switch (role) {
    case "Team Leader":
      return `${totalTasks} strategic checkpoints`;
    case "Sales":
      return `${totalTasks} commercial actions`;
    case "Production":
      return `${totalTasks} production runs`;
    case "Procurement":
      return `${totalTasks} sourcing moves`;
    case "Logistics":
      return `${totalTasks} fulfilment steps`;
    default:
      return `${totalTasks} tasks`;
  }
};

export interface TaskListProps {
  selectedRoles: Role[];
  className?: string;
}

export function TaskList({ selectedRoles, className }: TaskListProps) {
  const { tasks, updateTask } = useTasks();
  const { gameState } = useGameState();

  const currentRound = gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round || 1;

  const filteredTasks = useMemo(() => {
    if (!selectedRoles || selectedRoles.length === 0) return [] as Task[];

    return tasks
      .filter(task => selectedRoles.includes(task.role) && isTaskActiveForRound(task, currentRound))
      .sort((a, b) => {
        const priorityRanking: Record<Task["priority"], number> = {
          Critical: 1,
          High: 2,
          Medium: 3,
          Low: 4,
        };
        if (priorityRanking[a.priority] === priorityRanking[b.priority]) {
          return a.title.localeCompare(b.title);
        }
        return priorityRanking[a.priority] - priorityRanking[b.priority];
      });
  }, [tasks, selectedRoles, currentRound]);

  const tasksByRole = useMemo(() => {
    const groups = new Map<Role, Task[]>();
    filteredTasks.forEach(task => {
      const existing = groups.get(task.role as Role) ?? [];
      groups.set(task.role as Role, [...existing, task]);
    });
    return groups;
  }, [filteredTasks]);

  const orderedRoles = useMemo(() => {
    return ROLE_ORDER.filter(role => tasksByRole.has(role));
  }, [tasksByRole]);

  const toggleTask = (task: Task) => {
    updateTask({ ...task, completed: !task.completed });
  };

  if (!selectedRoles || selectedRoles.length === 0) {
    return (
      <Card className={cn("flex h-full items-center justify-center text-center text-sm text-muted-foreground", className)}>
        <CardContent>
          Pick at least one role to populate the task board.
        </CardContent>
      </Card>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <Card className={cn("flex h-full items-center justify-center text-center text-sm text-muted-foreground", className)}>
        <CardContent>
          No tasks are scheduled for the selected roles in round {currentRound}.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {orderedRoles.map(role => {
        const roleTasks = tasksByRole.get(role)!;
        return (
          <Card key={role} className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-headline">{role}</CardTitle>
                  <CardDescription>{roleHeading(role, roleTasks.length)}</CardDescription>
                </div>
                <Badge variant="outline">Round {currentRound}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[420px]">
                <div className="space-y-1 p-4">
                  {roleTasks.map(task => {
                    const goal = TASK_GOALS[task.id];
                    const evaluation = goal ? evaluateGoal(goal, gameState) : null;

                    return (
                      <div
                        key={task.id}
                        className={cn(
                          "rounded-lg border bg-card/80 p-4 shadow-sm transition-colors",
                          task.completed ? "border-success/40 bg-success/5" : "border-border hover:bg-muted/40"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => toggleTask(task)}
                            className="mt-0.5 text-muted-foreground transition-colors hover:text-primary"
                            aria-label={task.completed ? "Mark task incomplete" : "Mark task complete"}
                          >
                            {task.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5" />
                            )}
                          </button>
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className={cn("font-medium", task.completed && "line-through text-muted-foreground")}> 
                                {task.title}
                              </p>
                              <Badge variant={PRIORITY_VARIANT[task.priority]}>{PRIORITY_LABEL[task.priority]}</Badge>
                              <Badge variant="outline" className="gap-1">
                                <ClipboardList className="h-3.5 w-3.5" />
                                {task.transactionCode}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span>Est. {task.estimatedTime} min</span>
                              {task.roundRecurrence !== "Continuous" && (
                                <span>
                                  Starts round {task.startRound ?? 1} · {task.roundRecurrence}
                                </span>
                              )}
                            </div>
                            {evaluation && (
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant={evaluation.met ? "secondary" : "destructive"} className="gap-1">
                                  <Target className="h-3.5 w-3.5" />
                                  {evaluation.met ? "On track" : "Needs attention"}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {evaluation.label}: {evaluation.currentFormatted} / {evaluation.targetFormatted}
                                </span>
                                {evaluation.helper && (
                                  <span className="text-xs text-muted-foreground/80">{evaluation.helper}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        {task.dependencyIDs.length > 0 && (
                          <>
                            <Separator className="my-3" />
                            <p className="text-xs text-muted-foreground">
                              Dependencies: {task.dependencyIDs.join(", ")}
                            </p>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
