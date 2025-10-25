
"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ListTodo } from 'lucide-react';
import { InteractiveTaskCard } from '@/components/tasks/interactive-task-card';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useGameState } from '@/hooks/use-game-data';
import type { Task } from "@/types";

const DCS = ["DC10", "DC12", "DC14"];

type SalesFormData = {
    marketingBudget: { dc: string; budget: number; }[];
};

export default function ScenarioPlanningPage() {
    const { control, watch } = useForm<SalesFormData>({
        defaultValues: {
            marketingBudget: [
                { dc: "DC10", budget: 40000 },
                { dc: "DC12", budget: 30000 },
                { dc: "DC14", budget: 30000 },
            ]
        }
    });

    const { fields: budgetFields } = useFieldArray({ control, name: "marketingBudget" });

    const totalMarketingSpend = useMemo(() => {
        return watch("marketingBudget").reduce((total, item) => total + item.budget, 0);
    }, [watch]);

    const { profile } = useAuth();
    const { tasks, updateTask } = useTasks();
    const { gameState } = useGameState();
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    
    const currentRound = gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round || 1;

    const marketingTasks = useMemo(() => {
        if (!profile) return [];
        return tasks.filter(task =>
            task.role === profile.name &&
            task.transactionCode.includes("ZADS") &&
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
            {marketingTasks.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <ListTodo className="h-6 w-6" />
                            <div>
                                <CardTitle>Marketing Tasks</CardTitle>
                                <CardDescription>Execute marketing tasks for ZADS.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {marketingTasks.map(task => (
                            <InteractiveTaskCard
                                key={task.id}
                                task={task}
                                allTasks={tasks}
                                isActive={activeTaskId === task.id}
                                onToggle={() => setActiveTaskId(activeTaskId === task.id ? null : task.id)}
                                onUpdate={handleTaskUpdate}
                                onFindNext={(id) => handleFindNextTask(id, marketingTasks)}
                            />
                        ))}
                    </CardContent>
                </Card>
            )}
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Marketing (ZADS)</CardTitle>
                    <CardDescription>Set the advertising spend for each distribution channel for ZADS.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        {budgetFields.map((field, index) => (
                            <div key={field.id} className="space-y-2">
                                <Label>Ad Spend for {field.dc} (€)</Label>
                                <Controller
                                    control={control}
                                    name={`marketingBudget.${index}.budget`}
                                    render={({ field: controllerField }) => (
                                        <>
                                            <Slider
                                                value={[controllerField.value]}
                                                onValueChange={(vals) => controllerField.onChange(vals[0])}
                                                min={0}
                                                max={100000}
                                                step={1000}
                                            />
                                            <div className="text-right text-sm text-muted-foreground">
                                                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(controllerField.value)}
                                            </div>
                                        </>
                                    )}
                                />
                            </div>
                        ))}
                    </div>
                    <CardFooter className="flex-col items-start p-0 pt-4">
                        <p className="font-semibold">Total Marketing Spend: {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(totalMarketingSpend)}</p>
                        <div className="flex justify-end w-full mt-4">
                            <Button>Save Budget to SAP (ZADS)</Button>
                        </div>
                    </CardFooter>
                </CardContent>
            </Card>
        </div>
    )
}
