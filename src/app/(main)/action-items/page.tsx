
"use client";

import { useMemo, useState, useRef, useEffect, createRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTasks } from "@/hooks/use-tasks";
import { useGameState } from "@/hooks/use-game-data";
import { InteractiveTaskCard } from "@/components/tasks/interactive-task-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ListTodo, CheckCircle2, LocateFixed } from "lucide-react";
import { useTeamSettings } from "@/hooks/use-team-settings";
import { Button } from "@/components/ui/button";
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
  
  const taskRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
  taskRefs.current = relevantTasks.map((_, i) => taskRefs.current[i] ?? createRef());

  const [activeTaskIsVisible, setActiveTaskIsVisible] = useState(true);

  useEffect(() => {
    if (!activeTaskId) {
      setActiveTaskIsVisible(true);
      return;
    }
  
    const observer = new IntersectionObserver(
      ([entry]) => {
        setActiveTaskIsVisible(entry.isIntersecting);
      },
      { threshold: 0.5 } // 50% of the item must be visible
    );
  
    const activeTaskIndex = relevantTasks.findIndex(t => t.id === activeTaskId);
    const activeTaskRef = taskRefs.current[activeTaskIndex];
  
    if (activeTaskRef?.current) {
      observer.observe(activeTaskRef.current);
    }
  
    return () => {
      if (activeTaskRef?.current) {
        observer.unobserve(activeTaskRef.current);
      }
    };
  }, [activeTaskId, relevantTasks]);


  const handleTaskUpdate = (updatedTask: Task) => {
    updateTask(updatedTask);
  };
  
  const handleFindNextTask = (currentTaskId: string) => {
    const currentIndex = relevantTasks.findIndex(t => t.id === currentTaskId);
    if (currentIndex === -1) {
      setActiveTaskId(null);
      return;
    }

    let nextTask: Task | undefined;
    // Find the next incomplete task after the current one
    const nextIncompleteTask = relevantTasks.slice(currentIndex + 1).find(t => !t.completed);
    
    if (nextIncompleteTask) {
        nextTask = nextIncompleteTask;
    } else {
        // If no next task, try from the beginning (for looping or if last task was completed)
        const firstIncompleteTask = relevantTasks.find(t => !t.completed && t.id !== currentTaskId);
        nextTask = firstIncompleteTask;
    }
    
    if (nextTask) {
        setActiveTaskId(nextTask.id);
        const nextTaskIndex = relevantTasks.findIndex(t => t.id === nextTask!.id);
        taskRefs.current[nextTaskIndex]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        setActiveTaskId(null);
    }
  };
  
  const handleGoToTask = () => {
    if (!activeTaskId) return;
    const activeTaskIndex = relevantTasks.findIndex(t => t.id === activeTaskId);
    taskRefs.current[activeTaskIndex]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };


  if (!profile) {
    return null;
  }

  return (
    <>
      {activeTaskId && !activeTaskIsVisible && (
         <div className="fixed bottom-6 right-6 z-50">
            <Button size="lg" className="shadow-lg" onClick={handleGoToTask}>
                <LocateFixed className="mr-2 h-5 w-5" />
                Go to Current Task
            </Button>
        </div>
      )}
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
                {relevantTasks.map((task, index) => (
                  <InteractiveTaskCard
                    key={task.id}
                    ref={taskRefs.current[index]}
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
    </>
  );
}
