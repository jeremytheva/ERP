

"use client";

import { useMemo, useState, useRef, useEffect, createRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, PackageOpen, Ship, AlertTriangle, LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Truck, ListTodo } from 'lucide-react';
import { InteractiveTaskCard } from '@/components/tasks/interactive-task-card';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useGameState } from '@/hooks/use-game-data';
import type { Role, Task } from "@/types";


export default function LogisticsPage() {
    const cashBalance = 85000; // Mock data from Key Metrics
    const isCashAlertActive = cashBalance < 100000;
    
    const { profile } = useAuth();
    const { tasks, updateTask } = useTasks();
    const { gameState } = useGameState();
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

    const currentRound = gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round || 1;

    const monitoringTasks = useMemo(() => {
        if (!profile) return [];
        return tasks.filter(task =>
            task.role === profile.name &&
            (task.transactionCode === "ZFF7B/ZME2N" || task.transactionCode === "ZME2N (PO Status)") &&
             (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
        ).sort((a,b) => a.priority.localeCompare(b.priority));
    }, [tasks, profile, currentRound]);
    
    const stockTransferTasks = useMemo(() => {
        if (!profile) return [];
        return tasks.filter(task =>
            task.role === profile.name &&
            task.transactionCode === "ZMB1B" &&
             (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
        ).sort((a,b) => a.priority.localeCompare(b.priority));
    }, [tasks, profile, currentRound]);
    
    const allTasksForPage = useMemo(() => [...monitoringTasks, ...stockTransferTasks], [monitoringTasks, stockTransferTasks]);
    const taskRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
    taskRefs.current = allTasksForPage.map((_, i) => taskRefs.current[i] ?? createRef());

    const [activeTaskIsVisible, setActiveTaskIsVisible] = useState(true);

    useEffect(() => {
        if (!activeTaskId) {
        setActiveTaskIsVisible(true);
        return;
        }

        const observer = new IntersectionObserver(([entry]) => setActiveTaskIsVisible(entry.isIntersecting), { threshold: 0.5 });
        const activeTaskIndex = allTasksForPage.findIndex(t => t.id === activeTaskId);
        const activeTaskRef = taskRefs.current[activeTaskIndex];

        if (activeTaskRef?.current) observer.observe(activeTaskRef.current);
        return () => {
            if (activeTaskRef?.current) observer.unobserve(activeTaskRef.current);
        };
    }, [activeTaskId, allTasksForPage]);

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
            const nextTaskIndexInPage = allTasksForPage.findIndex(t => t.id === nextTask!.id);
            taskRefs.current[nextTaskIndexInPage]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            setActiveTaskId(null);
        }
    };

    const handleGoToTask = () => {
        if (!activeTaskId) return;
        const activeTaskIndex = allTasksForPage.findIndex(t => t.id === activeTaskId);
        taskRefs.current[activeTaskIndex]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const getTaskRefIndex = (taskId: string) => allTasksForPage.findIndex(t => t.id === taskId);

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
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Truck className="h-8 w-8 text-primary" />
                            <div>
                            <CardTitle className="font-headline text-3xl">Logistics Manager</CardTitle>
                            <CardDescription>Finished goods transfer, cash flow monitoring, and contingency planning.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
                
                {monitoringTasks.length > 0 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Banknote className="h-6 w-6" />
                                <CardTitle>Liquidity & Delivery Monitoring</CardTitle>
                            </div>
                             <CardDescription>Monitor current Cash Balance (ZFF7B) and track incoming raw material deliveries from ZME2N.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {monitoringTasks.map(task => (
                                <div key={task.id} className="relative pt-6">
                                    <InteractiveTaskCard
                                        ref={taskRefs.current[getTaskRefIndex(task.id)]}
                                        task={task}
                                        allTasks={tasks}
                                        isActive={activeTaskId === task.id}
                                        onToggle={() => setActiveTaskId(activeTaskId === task.id ? null : task.id)}
                                        onUpdate={handleTaskUpdate}
                                        onFindNext={(id) => handleFindNextTask(id, monitoringTasks)}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
                
                {stockTransferTasks.length > 0 && (
                    <Card>
                        <CardHeader>
                             <div className="flex items-center gap-3">
                                <PackageOpen className="h-6 w-6" />
                                <CardTitle>Stock Transfer (ZMB1B)</CardTitle>
                            </div>
                            <CardDescription>Calculate and plan stock transfers to DCs using ZMB1B. The Final Transfer Qty will be pushed to the LIT.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {stockTransferTasks.map(task => (
                                <div key={task.id} className="relative pt-6">
                                    <InteractiveTaskCard
                                        ref={taskRefs.current[getTaskRefIndex(task.id)]}
                                        task={task}
                                        allTasks={tasks}
                                        isActive={activeTaskId === task.id}
                                        onToggle={() => setActiveTaskId(activeTaskId === task.id ? null : task.id)}
                                        onUpdate={handleTaskUpdate}
                                        onFindNext={(id) => handleFindNextTask(id, stockTransferTasks)}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
