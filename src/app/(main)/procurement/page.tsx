

"use client";

import { useMemo, useState, useRef, useEffect, createRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Truck, Leaf, LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package } from 'lucide-react';
import { InteractiveTaskCard } from '@/components/tasks/interactive-task-card';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useGameState } from '@/hooks/use-game-data';
import type { Role, Task } from "@/types";

export default function ProcurementPage() {
    const { profile } = useAuth();
    const { tasks, updateTask } = useTasks();
    const { gameState } = useGameState();
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

    const currentRound = gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round || 1;

    const inventoryTasks = useMemo(() => {
        if (!profile) return [];
        return tasks.filter(task =>
            task.role === profile.name &&
            task.transactionCode === "ZMB52" &&
            (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
        ).sort((a,b) => a.priority.localeCompare(b.priority));
    }, [tasks, profile, currentRound]);
    
    const sourcingTasks = useMemo(() => {
        if (!profile) return [];
        return tasks.filter(task =>
            task.role === profile.name &&
            task.transactionCode === "ZME12" &&
            (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
        ).sort((a,b) => a.priority.localeCompare(b.priority));
    }, [tasks, profile, currentRound]);

    const orderTasks = useMemo(() => {
        if (!profile) return [];
        return tasks.filter(task =>
            task.role === profile.name &&
            task.transactionCode === "ME59N" &&
            (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
        ).sort((a,b) => a.priority.localeCompare(b.priority));
    }, [tasks, profile, currentRound]);

    const sustainabilityTasks = useMemo(() => {
        if (!profile) return [];
        return tasks.filter(task =>
            task.role === profile.name &&
            task.transactionCode === "ZFB50" &&
            (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
        ).sort((a,b) => a.priority.localeCompare(b.priority));
    }, [tasks, profile, currentRound]);
    
    const allTasksForPage = useMemo(() => [...inventoryTasks, ...sourcingTasks, ...orderTasks, ...sustainabilityTasks], [inventoryTasks, sourcingTasks, orderTasks, sustainabilityTasks]);
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
                            <ShoppingCart className="h-8 w-8 text-primary" />
                            <div>
                                <CardTitle className="font-headline text-3xl">Procurement Manager</CardTitle>
                                <CardDescription>RM sourcing, inventory replenishment, and sustainability investment.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {inventoryTasks.length > 0 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Package className="h-6 w-6" />
                                <CardTitle>Inventory Check (ZMB52)</CardTitle>
                            </div>
                            <CardDescription>Pulls current raw material stock and status from the LIT.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {inventoryTasks.map(task => (
                                 <div key={task.id} className="relative pt-6">
                                     <InteractiveTaskCard
                                        ref={taskRefs.current[getTaskRefIndex(task.id)]}
                                        task={task}
                                        allTasks={tasks}
                                        isActive={activeTaskId === task.id}
                                        onToggle={() => setActiveTaskId(activeTaskId === task.id ? null : task.id)}
                                        onUpdate={handleTaskUpdate}
                                        onFindNext={(id) => handleFindNextTask(id, inventoryTasks)}
                                    />
                                 </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
                
                {sourcingTasks.length > 0 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Users className="h-6 w-6" />
                                <CardTitle>Sourcing (ZME12)</CardTitle>
                            </div>
                            <CardDescription>Set the order strategy and vendor selection for each raw material.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {sourcingTasks.map(task => (
                                 <div key={task.id} className="relative pt-6">
                                    <InteractiveTaskCard
                                        ref={taskRefs.current[getTaskRefIndex(task.id)]}
                                        task={task}
                                        allTasks={tasks}
                                        isActive={activeTaskId === task.id}
                                        onToggle={() => setActiveTaskId(activeTaskId === task.id ? null : task.id)}
                                        onUpdate={handleTaskUpdate}
                                        onFindNext={(id) => handleFindNextTask(id, sourcingTasks)}
                                    />
                                 </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
                
                {orderTasks.length > 0 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Truck className="h-6 w-6" />
                                <CardTitle>Order Calculation (ME59N)</CardTitle>
                            </div>
                            <CardDescription>Calculate the required quantity to order based on MRP forecast and current stock.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {orderTasks.map(task => (
                                 <div key={task.id} className="relative pt-6">
                                    <InteractiveTaskCard
                                        ref={taskRefs.current[getTaskRefIndex(task.id)]}
                                        task={task}
                                        allTasks={tasks}
                                        isActive={activeTaskId === task.id}
                                        onToggle={() => setActiveTaskId(activeTaskId === task.id ? null : task.id)}
                                        onUpdate={handleTaskUpdate}
                                        onFindNext={(id) => handleFindNextTask(id, orderTasks)}
                                    />
                                 </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {sustainabilityTasks.length > 0 && (
                     <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Leaf className="h-6 w-6" />
                                <CardTitle>Sustainability (ZFB50)</CardTitle>
                            </div>
                            <CardDescription>Track sustainability goals and investment amounts for ZFB50.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {sustainabilityTasks.map(task => (
                                 <div key={task.id} className="relative pt-6">
                                     <InteractiveTaskCard
                                        ref={taskRefs.current[getTaskRefIndex(task.id)]}
                                        task={task}
                                        allTasks={tasks}
                                        isActive={activeTaskId === task.id}
                                        onToggle={() => setActiveTaskId(activeTaskId === task.id ? null : task.id)}
                                        onUpdate={handleTaskUpdate}
                                        onFindNext={(id) => handleFindNextTask(id, sustainabilityTasks)}
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
