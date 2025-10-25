
"use client";

import { useMemo, useState, useRef, useEffect, createRef } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info, TrendingUp, ListTodo, LocateFixed } from "lucide-react";
import { InteractiveTaskCard } from '@/components/tasks/interactive-task-card';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useGameState } from '@/hooks/use-game-data';
import type { Task } from "@/types";
import { Button } from "@/components/ui/button";

type SalesFormData = {
    competitorAvgPrice: number;
};

export default function SalesPage() {
    const { register } = useForm<SalesFormData>({
        defaultValues: {
            competitorAvgPrice: 15.50,
        }
    });

    const { profile } = useAuth();
    const { tasks, updateTask } = useTasks();
    const { gameState } = useGameState();
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    
    const currentRound = gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round || 1;

    const marketAnalysisTasks = useMemo(() => {
        if (!profile) return [];
        return tasks.filter(task =>
            task.role === profile.name &&
            task.transactionCode.includes("ZMARKET") &&
             (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
        ).sort((a,b) => a.priority.localeCompare(b.priority));
    }, [tasks, profile, currentRound]);

    const taskRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
    taskRefs.current = marketAnalysisTasks.map((_, i) => taskRefs.current[i] ?? createRef());

    const [activeTaskIsVisible, setActiveTaskIsVisible] = useState(true);

    useEffect(() => {
        if (!activeTaskId) {
        setActiveTaskIsVisible(true);
        return;
        }

        const observer = new IntersectionObserver(([entry]) => setActiveTaskIsVisible(entry.isIntersecting), { threshold: 0.5 });
        const activeTaskIndex = marketAnalysisTasks.findIndex(t => t.id === activeTaskId);
        const activeTaskRef = taskRefs.current[activeTaskIndex];

        if (activeTaskRef?.current) observer.observe(activeTaskRef.current);
        return () => {
            if (activeTaskRef?.current) observer.unobserve(activeTaskRef.current);
        };
    }, [activeTaskId, marketAnalysisTasks]);

    const handleTaskUpdate = (updatedTask: Task) => {
        updateTask(updatedTask);
    };

    const handleFindNextTask = (currentTaskId: string, taskGroup: Task[]) => {
        const currentIndex = taskGroup.findIndex(t => t.id === currentTaskId);
        if (currentIndex === -1) {
            setActiveTaskId(null);
            return;
        }
        let nextTask: Task | undefined;
        const nextIncompleteTask = taskGroup.slice(currentIndex + 1).find(t => !t.completed);
        if (nextIncompleteTask) {
            nextTask = nextIncompleteTask;
        } else {
            const firstIncompleteTask = taskGroup.find(t => !t.completed && t.id !== currentTaskId);
            nextTask = firstIncompleteTask;
        }

        if (nextTask) {
            setActiveTaskId(nextTask.id);
            const nextTaskIndex = taskGroup.findIndex(t => t.id === nextTask!.id);
            taskRefs.current[nextTaskIndex]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            setActiveTaskId(null);
        }
    };
    
    const handleGoToTask = () => {
        if (!activeTaskId) return;
        const activeTaskIndex = marketAnalysisTasks.findIndex(t => t.id === activeTaskId);
        taskRefs.current[activeTaskIndex]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

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
            <div className="space-y-6">
                {marketAnalysisTasks.length > 0 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <ListTodo className="h-6 w-6" />
                                <div>
                                    <CardTitle>Market Analysis Tasks</CardTitle>
                                    <CardDescription>Execute tasks related to market analysis (ZMARKET).</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {marketAnalysisTasks.map((task, index) => (
                                <InteractiveTaskCard
                                    key={task.id}
                                    ref={taskRefs.current[index]}
                                    task={task}
                                    allTasks={tasks}
                                    isActive={activeTaskId === task.id}
                                    onToggle={() => setActiveTaskId(activeTaskId === task.id ? null : task.id)}
                                    onUpdate={handleTaskUpdate}
                                    onFindNext={(id) => handleFindNextTask(id, marketAnalysisTasks)}
                                />
                            ))}
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl">Market Analysis (ZMARKET)</CardTitle>
                        <CardDescription>Extract key market data from ZMARKET to drive pricing decisions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="competitorAvgPrice">Competitor Avg. Price (€)</Label>
                            <Input id="competitorAvgPrice" type="number" step="0.01" {...register("competitorAvgPrice", { valueAsNumber: true })} />
                        </div>
                            <div className="rounded-lg border bg-secondary/30 p-4">
                            <div className="flex items-start gap-3">
                                <Info className="h-5 w-5 mt-0.5 text-primary" />
                                <div>
                                    <h4 className="font-semibold">Data from Key Metrics</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Market Share: <strong>25%</strong> <TrendingUp className="inline h-4 w-4 text-green-500" />
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        On-Time Delivery: <strong>98%</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
