
"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTasks } from "@/hooks/use-tasks";
import { useGameState } from "@/hooks/use-game-data";
import { InteractiveTaskCard } from "@/components/tasks/interactive-task-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ListTodo, CheckCircle2 } from "lucide-react";
import { useTeamSettings } from "@/hooks/use-team-settings";
import type { Role, Task } from "@/types";

export default function ActionItemsPage() {
  const { profile } = useAuth();
  const { tasks, updateTask } = useTasks();
  const { gameState } = useGameState();
  const { teamLeader } = useTeamSettings();
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const currentRound = gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round || 1;

  const userRoles = useMemo(() => {
    if (!profile) return [];
    const roles: Role[] = [profile.name as Role];
    if (profile.id === teamLeader) {
      roles.push("Team Leader");
    }
    return roles;
  }, [profile, teamLeader]);

  const relevantTasks = useMemo(() => {
    return tasks.filter(task =>
      userRoles.includes(task.role) &&
      (
        task.roundRecurrence === "Continuous" ||
        (task.roundRecurrence === "RoundStart" && (task.startRound ?? 1) <= currentRound) ||
        (task.roundRecurrence === "Once" && (task.startRound ?? 1) === currentRound)
      )
    ).sort((a, b) => {
        const priorityOrder = { "Critical": 1, "High": 2, "Medium": 3, "Low": 4 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [tasks, userRoles, currentRound]);

  const handleTaskUpdate = (updatedTask: Task) => {
    updateTask(updatedTask);
  };
  
  const handleFindNextTask = (currentTaskId: string) => {
    const currentIndex = relevantTasks.findIndex(t => t.id === currentTaskId);
    if (currentIndex === -1) {
      setActiveTaskId(null);
      return;
    }

    // Find the next incomplete task after the current one
    const nextTask = relevantTasks.slice(currentIndex + 1).find(t => !t.completed);
    
    if (nextTask) {
        setActiveTaskId(nextTask.id);
    } else {
        // If no next task, try from the beginning (for looping or if last task was completed)
        const firstIncompleteTask = relevantTasks.find(t => !t.completed && t.id !== currentTaskId);
        setActiveTaskId(firstIncompleteTask ? firstIncompleteTask.id : null);
    }
  };


  if (!profile) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <ListTodo className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-3xl">Tasks for Round {currentRound}</CardTitle>
              <CardDescription>
                Your dynamic to-do list for the current round. Click a task to see details and enter data.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {relevantTasks.length > 0 ? (
            <div className="space-y-4">
              {relevantTasks.map((task) => (
                <InteractiveTaskCard
                  key={task.id}
                  task={task}
                  allTasks={tasks}
                  isActive={activeTaskId === task.id}
                  onToggle={() => setActiveTaskId(activeTaskId === task.id ? null : task.id)}
                  onUpdate={handleTaskUpdate}
                  onFindNext={handleFindNextTask}
                />
              ))}
            </div>
          ) : (
             <div className="text-center py-10">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-4 text-lg font-medium">All Clear!</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    There are no tasks assigned to your role for this round.
                </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
