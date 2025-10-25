
"use client";

import { useMemo, useState, useRef, useEffect, createRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListTodo, Lightbulb, LocateFixed } from "lucide-react";
import { InteractiveTaskCard } from '@/components/tasks/interactive-task-card';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useGameState } from '@/hooks/use-game-data';
import type { Task, Role } from "@/types";
import { useTeamSettings } from "@/hooks/use-team-settings";

export default function StrategicAdvisorPage() {
    const { profile } = useAuth();
    const { tasks, updateTask } = useTasks();
    const { gameState } = useGameState();
    const { teamLeader } = useTeamSettings();
    const [openedTaskId, setOpenedTaskId] = useState<string | null>(null);
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

    const pricingTasks = useMemo(() => {
        if (!profile) return [];
        return tasks.filter(task =>
            userRoles.includes(task.role) &&
            task.transactionCode.includes("VK32") &&
             (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
        ).sort((a,b) => a.priority.localeCompare(b.priority));
    }, [tasks, profile, currentRound, userRoles]);

    const strategyTasks = useMemo(() => {
        if (!isTeamLeader) return [];
        return tasks.filter(task =>
            task.role === "Team Leader" &&
            (task.transactionCode === "N/A" || task.transactionCode.includes("F.01")) && // Team leader strategy tasks
            (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
        ).sort((a, b) => a.priority.localeCompare(b.priority));
    }, [tasks, isTeamLeader, currentRound]);
    
    const allTasksForPage = useMemo(() => [...strategyTasks, ...pricingTasks], [strategyTasks, pricingTasks]);
    
    useEffect(() => {
        const firstIncomplete = allTasksForPage.find(t => !t.completed);
        if (firstIncomplete) {
            setActiveTaskId(firstIncomplete.id);
            if (!openedTaskId) {
                setOpenedTaskId(firstIncomplete.id);
            }
        } else {
            setActiveTaskId(null);
        }
    }, [allTasksForPage, openedTaskId]);

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
        if (updatedTask.completed && updatedTask.id === activeTaskId) {
            handleFindNextTask(updatedTask.id, allTasksForPage);
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
            const nextTaskIndexInPage = allTasksForPage.findIndex(t => t.id === nextIncompleteTask.id);
            taskRefs.current[nextTaskIndexInPage]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            setOpenedTaskId(null);
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
                {isTeamLeader && strategyTasks.length > 0 && (
                     <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <ListTodo className="h-6 w-6" />
                                <div>
                                    <CardTitle>Team Leader: Strategy Tasks</CardTitle>
                                    <CardDescription>Review KPIs and manage overall team strategy.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {strategyTasks.map(task => (
                                <div key={task.id} className="relative pt-6">
                                    <InteractiveTaskCard
                                        ref={taskRefs.current[getTaskRefIndex(task.id)]}
                                        task={task}
                                        allTasks={tasks}
                                        isActive={openedTaskId === task.id}
                                        isCurrent={activeTaskId === task.id}
                                        onToggle={() => setOpenedTaskId(openedTaskId === task.id ? null : task.id)}
                                        onUpdate={handleTaskUpdate}
                                        onFindNext={(id) => handleFindNextTask(id, strategyTasks)}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                             <Lightbulb className="h-6 w-6" />
                            <div>
                                <CardTitle className="font-headline text-3xl">Pricing (VK32)</CardTitle>
                                <CardDescription>Set the final price for all products for VK32. Use the strategy tool to set prices relative to the competitor average.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {pricingTasks.map(task => (
                            <div key={task.id} className="relative pt-6">
                                <InteractiveTaskCard
                                    ref={taskRefs.current[getTaskRefIndex(task.id)]}
                                    task={task}
                                    allTasks={tasks}
                                    isActive={openedTaskId === task.id}
                                    isCurrent={activeTaskId === task.id}
                                    onToggle={() => setOpenedTaskId(openedTaskId === task.id ? null : task.id)}
                                    onUpdate={handleTaskUpdate}
                                    onFindNext={(id) => handleFindNextTask(id, pricingTasks)}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
