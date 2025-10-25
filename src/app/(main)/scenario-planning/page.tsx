
"use client";

import { useMemo, useState, useRef, useEffect, createRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListTodo, LocateFixed } from 'lucide-react';
import { InteractiveTaskCard } from '@/components/tasks/interactive-task-card';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useGameState } from '@/hooks/use-game-data';
import type { Task } from "@/types";

export default function ScenarioPlanningPage() {
    const { profile } = useAuth();
    const { tasks, updateTask } = useTasks();
    const { gameState } = useGameState();
    const [openedTaskId, setOpenedTaskId] = useState<string | null>(null);
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
    
    useEffect(() => {
        const firstIncomplete = marketingTasks.find(t => !t.completed);
        if (firstIncomplete) {
            setActiveTaskId(firstIncomplete.id);
            if (!openedTaskId) {
                setOpenedTaskId(firstIncomplete.id);
            }
        } else {
            setActiveTaskId(null);
        }
    }, [marketingTasks, openedTaskId]);

    const taskRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
    taskRefs.current = marketingTasks.map((_, i) => taskRefs.current[i] ?? createRef());

    const [activeTaskIsVisible, setActiveTaskIsVisible] = useState(true);

     useEffect(() => {
        if (!activeTaskId) {
            setActiveTaskIsVisible(true);
            return;
        }

        const observer = new IntersectionObserver(([entry]) => setActiveTaskIsVisible(entry.isIntersecting), { threshold: 0.5 });
        const activeTaskIndex = marketingTasks.findIndex(t => t.id === activeTaskId);
        const activeTaskRef = taskRefs.current[activeTaskIndex];

        if (activeTaskRef?.current) observer.observe(activeTaskRef.current);
        return () => {
            if (activeTaskRef?.current) observer.unobserve(activeTaskRef.current);
        };
    }, [activeTaskId, marketingTasks]);

    const handleTaskUpdate = (updatedTask: Task) => {
        updateTask(updatedTask);
        if (updatedTask.completed && updatedTask.id === activeTaskId) {
            handleFindNextTask(updatedTask.id, marketingTasks);
        }
    };

    const handleFindNextTask = (currentTaskId: string, taskGroup: Task[]) => {
        const currentIndex = taskGroup.findIndex(t => t.id === currentTaskId);
        if (currentIndex === -1) {
            setOpenedTaskId(null);
            return;
        }
        const nextIncompleteTask = taskGroup.slice(currentIndex + 1).find(t => !t.completed);

        if (nextIncompleteTask) {
            setOpenedTaskId(nextIncompleteTask.id);
            const nextTaskIndex = taskGroup.findIndex(t => t.id === nextIncompleteTask.id);
            taskRefs.current[nextTaskIndex]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            setOpenedTaskId(null);
        }
    };
    
    const handleGoToTask = () => {
        if (!activeTaskId) return;
        const activeTaskIndex = marketingTasks.findIndex(t => t.id === activeTaskId);
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
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl">Marketing (ZADS)</CardTitle>
                        <CardDescription>Set the advertising spend for each distribution channel for ZADS.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {marketingTasks.map((task, index) => (
                            <div key={task.id} className="relative pt-6">
                                <InteractiveTaskCard
                                    ref={taskRefs.current[index]}
                                    task={task}
                                    allTasks={tasks}
                                    isActive={openedTaskId === task.id}
                                    isCurrent={activeTaskId === task.id}
                                    onToggle={() => setOpenedTaskId(openedTaskId === task.id ? null : task.id)}
                                    onUpdate={handleTaskUpdate}
                                    onFindNext={(id) => handleFindNextTask(id, marketingTasks)}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
