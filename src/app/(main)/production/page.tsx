

"use client";

import { useMemo, useState, useRef, useEffect, createRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileBox, Wrench, PackageCheck, FileSignature, LocateFixed } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Factory } from 'lucide-react';
import { InteractiveTaskCard } from '@/components/tasks/interactive-task-card';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useGameState } from '@/hooks/use-game-data';
import type { Role, Task } from "@/types";

export default function ProductionPage() {
    const { profile } = useAuth();
    const { tasks, updateTask } = useTasks();
    const { gameState } = useGameState();
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

    const currentRound = gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round || 1;

    const planningTasks = useMemo(() => {
        if (!profile) return [];
        return tasks.filter(task =>
            task.role === profile.name &&
            (task.transactionCode.includes("ZMB52") || task.transactionCode.includes("ZCOOIS")) &&
             (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
        ).sort((a,b) => a.priority.localeCompare(b.priority));
    }, [tasks, profile, currentRound]);
    
    const mrpTasks = useMemo(() => {
        if (!profile) return [];
        return tasks.filter(task =>
            task.role === profile.name &&
            task.transactionCode === "MD01" &&
             (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
        ).sort((a,b) => a.priority.localeCompare(b.priority));
    }, [tasks, profile, currentRound]);
    
    const releaseTasks = useMemo(() => {
        if (!profile) return [];
        return tasks.filter(task =>
            task.role === profile.name &&
            task.transactionCode.startsWith("CO41") &&
             (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
        ).sort((a,b) => a.priority.localeCompare(b.priority));
    }, [tasks, profile, currentRound]);

    const bomTasks = useMemo(() => {
        if (!profile) return [];
        return tasks.filter(task =>
            task.role === profile.name &&
            task.transactionCode === "ZCS02" &&
             (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
        ).sort((a,b) => a.priority.localeCompare(b.priority));
    }, [tasks, profile, currentRound]);

    const allTasksForPage = useMemo(() => [...planningTasks, ...mrpTasks, ...releaseTasks, ...bomTasks], [planningTasks, mrpTasks, releaseTasks, bomTasks]);
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
                            <Factory className="h-8 w-8 text-primary" />
                            <div>
                            <CardTitle className="font-headline text-3xl">Production Manager</CardTitle>
                            <CardDescription>Capacity, efficiency, BOM, and production release management.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {planningTasks.length > 0 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <FileBox className="h-6 w-6" />
                                <CardTitle>Planning & Capacity</CardTitle>
                            </div>
                            <CardDescription>Confirm capacity, set lot size strategy, and check for overstock.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {planningTasks.map(task => (
                                 <div key={task.id} className="relative pt-6">
                                    <InteractiveTaskCard
                                        ref={taskRefs.current[getTaskRefIndex(task.id)]}
                                        task={task}
                                        allTasks={tasks}
                                        isActive={activeTaskId === task.id}
                                        onToggle={() => setActiveTaskId(activeTaskId === task.id ? null : task.id)}
                                        onUpdate={handleTaskUpdate}
                                        onFindNext={(id) => handleFindNextTask(id, planningTasks)}
                                    />
                                 </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
                

                {mrpTasks.length > 0 && (
                     <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Wrench className="h-6 w-6" />
                                <CardTitle>MRP (MD01)</CardTitle>
                            </div>
                            <CardDescription>Execute the MRP run after the forecast is finalized.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {mrpTasks.map(task => (
                                 <div key={task.id} className="relative pt-6">
                                    <InteractiveTaskCard
                                        ref={taskRefs.current[getTaskRefIndex(task.id)]}
                                        task={task}
                                        allTasks={tasks}
                                        isActive={activeTaskId === task.id}
                                        onToggle={() => setActiveTaskId(activeTaskId === task.id ? null : task.id)}
                                        onUpdate={handleTaskUpdate}
                                        onFindNext={(id) => handleFindNextTask(id, mrpTasks)}
                                    />
                                 </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
                
                {releaseTasks.length > 0 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <PackageCheck className="h-6 w-6" />
                                <CardTitle>Production Release (CO41)</CardTitle>
                            </div>
                            <CardDescription>Final step to release production orders. The output will be logged to the LIT.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {releaseTasks.map(task => (
                                 <div key={task.id} className="relative pt-6">
                                    <InteractiveTaskCard
                                        ref={taskRefs.current[getTaskRefIndex(task.id)]}
                                        task={task}
                                        allTasks={tasks}
                                        isActive={activeTaskId === task.id}
                                        onToggle={() => setActiveTaskId(activeTaskId === task.id ? null : task.id)}
                                        onUpdate={handleTaskUpdate}
                                        onFindNext={(id) => handleFindNextTask(id, releaseTasks)}
                                    />
                                 </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {bomTasks.length > 0 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <FileSignature className="h-6 w-6" />
                                <CardTitle>BOM Review (ZCS02)</CardTitle>
                            </div>
                            <CardDescription>Track recipe changes for cost or sustainability.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {bomTasks.map(task => (
                                 <div key={task.id} className="relative pt-6">
                                     <InteractiveTaskCard
                                        ref={taskRefs.current[getTaskRefIndex(task.id)]}
                                        task={task}
                                        allTasks={tasks}
                                        isActive={activeTaskId === task.id}
                                        onToggle={() => setActiveTaskId(activeTaskId === task.id ? null : task.id)}
                                        onUpdate={handleTaskUpdate}
                                        onFindNext={(id) => handleFindNextTask(id, bomTasks)}
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
