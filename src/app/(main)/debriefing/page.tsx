
"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ListTodo } from 'lucide-react';
import { InteractiveTaskCard } from '@/components/tasks/interactive-task-card';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useGameState } from '@/hooks/use-game-data';
import type { Task } from "@/types";

type SalesFormData = {
    forecastUnits: number;
};

export default function DebriefingPage() {
    const { register } = useForm<SalesFormData>({
        defaultValues: {
            forecastUnits: 120000,
        }
    });

    const { profile } = useAuth();
    const { tasks, updateTask } = useTasks();
    const { gameState } = useGameState();
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    
    const currentRound = gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round || 1;

    const forecastingTasks = useMemo(() => {
        if (!profile) return [];
        return tasks.filter(task =>
            task.role === profile.name &&
            task.transactionCode.includes("MD61") &&
             (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
        ).sort((a,b) => a.priority.localeCompare(b.priority));
    }, [tasks, profile, currentRound]);

    const handleTaskUpdate = (updatedTask: Task) => {
        updateTask(updatedTask);
    };

    const handleFindNextTask = (currentTaskId: string, taskGroup: Task[]) => {
        const currentIndex = taskGroup.findIndex(t => t.id === currentTaskId);
        if (currentIndex === -1) {
            setActiveTaskId(null);
            return;
        }
        const nextTask = taskGroup.slice(currentIndex + 1).find(t => !t.completed);
        if (nextTask) {
            setActiveTaskId(nextTask.id);
        } else {
            const firstIncompleteTask = taskGroup.find(t => !t.completed && t.id !== currentTaskId);
            setActiveTaskId(firstIncompleteTask ? firstIncompleteTask.id : null);
        }
    };

    return (
        <div className="space-y-6">
            {forecastingTasks.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <ListTodo className="h-6 w-6" />
                            <div>
                                <CardTitle>Forecasting Tasks</CardTitle>
                                <CardDescription>Execute forecasting tasks for MD61.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {forecastingTasks.map(task => (
                            <InteractiveTaskCard
                                key={task.id}
                                task={task}
                                allTasks={tasks}
                                isActive={activeTaskId === task.id}
                                onToggle={() => setActiveTaskId(activeTaskId === task.id ? null : task.id)}
                                onUpdate={handleTaskUpdate}
                                onFindNext={(id) => handleFindNextTask(id, forecastingTasks)}
                            />
                        ))}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Forecasting (MD61)</CardTitle>
                    <CardDescription>Calculate and set the total sales forecast for MD61. This will be pushed to the LIT.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                        <div className="space-y-2">
                        <Label htmlFor="forecastUnits">R-N Total Forecast (Units)</Label>
                        <Input id="forecastUnits" type="number" step="1000" {...register("forecastUnits", { valueAsNumber: true })} />
                    </div>
                    <Button>Push Forecast to LIT</Button>
                </CardContent>
            </Card>
        </div>
    );
}
