
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo, Lightbulb } from "lucide-react";
import { InteractiveTaskCard } from '@/components/tasks/interactive-task-card';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useGameState } from '@/hooks/use-game-data';
import type { Task, Role } from "@/types";
import { useTeamSettings } from "@/hooks/use-team-settings";
import { useTaskNavigation } from "@/context/task-navigation-context";
import { AdvisorInsights } from "@/components/ai/advisor-insights";
import { StrategicNotesEditor } from "@/components/ai/strategic-notes-editor";

export default function StrategicAdvisorPage() {
    const { profile } = useAuth();
    const { tasks, updateTask } = useTasks();
    const { gameState } = useGameState();
    const { teamLeader } = useTeamSettings();
    const { activeTaskId, openedTaskId, setOpenedTaskId, getTaskRef } = useTaskNavigation();
    
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
            (task.transactionCode === "N/A (Team Coordination)" || task.transactionCode.includes("F.01") || task.transactionCode.includes("Dashboard")) &&
            (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
        ).sort((a, b) => a.priority.localeCompare(b.priority));
    }, [tasks, isTeamLeader, currentRound]);
    
    const allTasksForPage = useMemo(() => [...strategyTasks, ...pricingTasks], [strategyTasks, pricingTasks]);
    
    const handleFindNextTask = (currentTaskId: string, taskGroup: Task[]) => {
        const currentIndex = taskGroup.findIndex(t => t.id === currentTaskId);
        if (currentIndex === -1) {
            setOpenedTaskId(null);
            return;
        }
        const nextIncompleteTask = taskGroup.slice(currentIndex + 1).find(t => !t.completed);

        if (nextIncompleteTask) {
            setOpenedTaskId(nextIncompleteTask.id);
            const taskRef = getTaskRef(nextIncompleteTask.id);
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
                                    ref={getTaskRef(task.id)}
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
                                ref={getTaskRef(task.id)}
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

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Lightbulb className="h-6 w-6" />
                        <div>
                            <CardTitle className="font-headline text-3xl">AI Advisor Insights</CardTitle>
                            <CardDescription>Review the latest saved scenario analysis and capture team notes.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <AdvisorInsights />
                    <StrategicNotesEditor />
                </CardContent>
            </Card>
        </div>
    )
}
