
"use client";

import { useMemo, useState, useRef, createRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo, FileText } from 'lucide-react';
import { InteractiveTaskCard } from '@/components/tasks/interactive-task-card';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useGameState } from '@/hooks/use-game-data';
import type { Task, Role } from "@/types";
import { useTeamSettings } from "@/hooks/use-team-settings";
import { useTaskNavigation } from "@/context/task-navigation-context";

export default function DebriefingPage() {
    const { profile } = useAuth();
    const { tasks, updateTask } = useTasks();
    const { gameState } = useGameState();
    const { teamLeader } = useTeamSettings();
    
    const { activeTaskId, openedTaskId, setOpenedTaskId, taskRefs } = useTaskNavigation();

    const currentRound = gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round || 1;
    const isTeamLeader = profile?.id === teamLeader;

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
    
    const getTaskRefIndex = (taskId: string) => allTasksForPage.findIndex(t => t.id === taskId);

    const handleFindNextTask = (currentTaskId: string, taskGroup: Task[]) => {
        const currentIndex = taskGroup.findIndex(t => t.id === currentTaskId);
        if (currentIndex === -1) {
            setOpenedTaskId(null);
            return;
        }
        const nextIncompleteTask = taskGroup.slice(currentIndex + 1).find(t => !t.completed);

        if (nextIncompleteTask) {
            setOpenedTaskId(nextIncompleteTask.id);
            const nextTaskIndexInPage = allTasksForPage.findIndex(t => t.id === nextIncompleteTask.id);
            const taskRef = taskRefs.current[nextTaskIndexInPage];
            if (taskRef?.current) {
                taskRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            setOpenedTaskId(null);
        }
    };

    const handleTaskUpdate = (updatedTask: Task) => {
        updateTask(updatedTask);
        if (updatedTask.completed && updatedTask.id === activeTaskId) {
            handleFindNextTask(updatedTask.id, allTasksForPage);
        }
    };

    return (
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
                            <div key={task.id} className="relative pt-6">
                                <InteractiveTaskCard
                                    ref={taskRefs.current[getTaskRefIndex(task.id)]}
                                    task={task}
                                    allTasks={tasks}
                                    isActive={openedTaskId === task.id}
                                    isCurrent={activeTaskId === task.id}
                                    onToggle={() => setOpenedTaskId(openedTaskId === task.id ? null : task.id)}
                                    onUpdate={handleTaskUpdate}
                                    onFindNext={(id) => handleFindNextTask(id, teamLeaderTasks)}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {forecastingTasks.length > 0 && (
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
                    <CardContent className="space-y-2">
                        {forecastingTasks.map(task => (
                            <div key={task.id} className="relative pt-6">
                                <InteractiveTaskCard
                                    ref={taskRefs.current[getTaskRefIndex(task.id)]}
                                    task={task}
                                    allTasks={tasks}
                                    isActive={openedTaskId === task.id}
                                    isCurrent={activeTaskId === task.id}
                                    onToggle={() => setOpenedTaskId(openedTaskId === task.id ? null : task.id)}
                                    onUpdate={handleTaskUpdate}
                                    onFindNext={(id) => handleFindNextTask(id, forecastingTasks)}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
