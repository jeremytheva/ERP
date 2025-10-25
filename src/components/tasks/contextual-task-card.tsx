

"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTasks } from "@/hooks/use-tasks";
import { useGameState } from "@/hooks/use-game-data";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { CheckCircle, Circle, ListTodo } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import type { Task, Role } from "@/types";

interface ContextualTaskCardProps {
  transactionCode: string;
  title: string;
  description: string;
  className?: string;
}

export function ContextualTaskCard({ transactionCode, title, description, className }: ContextualTaskCardProps) {
  const { profile } = useAuth();
  const { tasks, updateTask } = useTasks();
  const { gameState } = useGameState();

  const currentRound = gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round || 1;

  const relevantTasks = useMemo(() => {
    if (!profile) return [];
    return tasks.filter(task =>
      task.role === profile.name &&
      task.transactionCode === transactionCode &&
      (
        task.roundRecurrence === "Continuous" ||
        (task.roundRecurrence === "RoundStart" && (task.startRound ?? 1) <= currentRound) ||
        (task.roundRecurrence === "Once" && (task.startRound ?? 1) === currentRound)
      )
    ).sort((a, b) => {
        const priorityOrder = { "Critical": 1, "High": 2, "Medium": 3, "Low": 4 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [tasks, profile, transactionCode, currentRound]);

  const handleTaskToggle = (task: Task) => {
    updateTask({ ...task, completed: !task.completed });
  };

  if (relevantTasks.length === 0) {
    return null;
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
            <ListTodo className="h-6 w-6" />
            <div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {relevantTasks.map(task => (
          <Button
            key={task.id}
            variant="ghost"
            className="flex h-auto w-full justify-start gap-3 p-2 text-left"
            onClick={() => handleTaskToggle(task)}
          >
            {task.completed ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
            <span className={cn("flex-1", task.completed && "line-through text-muted-foreground")}>
              {task.title}
            </span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
