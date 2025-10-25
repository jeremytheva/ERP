
"use client";

import { useMemo, useState, useRef, useEffect, createRef } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ListTodo, FileText, LocateFixed } from 'lucide-react';
import { InteractiveTaskCard } from '@/components/tasks/interactive-task-card';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useGameState } from '@/hooks/use-game-data';
import type { Task, Role } from "@/types";
import { useTeamSettings } from "@/hooks/use-team-settings";


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
    const { teamLeader } = useTeamSettings();
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    
    const currentRound = gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round || 1;
    const isTeamLeader = profile?.id === teamLeader;

    const userRoles = useMemo(() => {
        if (!profile) return [];
        const roles: Role[] = [profile.name as Role];
        if (isTeamLeader) {
            roles.push("Team Leader");
        }
        return roles;
    }, [profile, isTeamLeader]);

    const forecastingTasks = useMemo(() => {
        if (!profile) return [];
        return tasks.filter(task =>
            task.role === profile.name &&
            task.transactionCode.includes("MD61") &&
             (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
        ).sort((a,b) => a.priority.localeCompare(b.priority));
    }, [tasks, profile, currentRound]);
    
    const teamLeaderTasks = useMemo(() => {
        if (!isTeamLeader) return [];
        return tasks.filter(task =>
            task.role === "Team Leader" &&
            task.transactionCode.includes("ZFB50") && // Investment decisions
            (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
        ).sort((a, b) => a.priority.localeCompare(b.priority));
    }, [tasks, isTeamLeader, currentRound]);

    const allTasksForPage = useMemo(() => [...teamLeaderTasks, ...forecastingTasks], [teamLeaderTasks, forecastingTasks]);
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
                 {isTeamLeader && teamLeaderTasks.length > 0 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <ListTodo className="h-6 w-6" />
                                <div>
                                    <CardTitle>Team Leader: Investment Tasks</CardTitle>
                                    <CardDescription>Finalize and confirm investment decisions.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {teamLeaderTasks.map(task => (
                                <InteractiveTaskCard
                                    key={task.id}
                                    ref={taskRefs.current[getTaskRefIndex(task.id)]}
                                    task={task}
                                    allTasks={tasks}
                                    isActive={activeTaskId === task.id}
                                    onToggle={() => setActiveTaskId(activeTaskId === task.id ? null : task.id)}
                                    onUpdate={handleTaskUpdate}
                                    onFindNext={(id) => handleFindNextTask(id, teamLeaderTasks)}
                                />
                            ))}
                        </CardContent>
                    </Card>
                )}

                {forecastingTasks.length > 0 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <ListTodo className="h-6 w-6" />
                                <div>
                                    <CardTitle>Forecasting Tasks (MD61)</CardTitle>
                                    <CardDescription>Execute forecasting tasks.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {forecastingTasks.map(task => (
                                <InteractiveTaskCard
                                    key={task.id}
                                    ref={taskRefs.current[getTaskRefIndex(task.id)]}
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
                        <div className="flex items-center gap-3">
                            <FileText className="h-6 w-6" />
                            <div>
                                <CardTitle className="font-headline text-3xl">Forecasting (MD61)</CardTitle>
                                <CardDescription>Calculate and set the total sales forecast for MD61. This will be pushed to the LIT.</CardDescription>
                            </div>
                        </div>
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
        </>
    );
}
