
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InteractiveTaskCard } from '@/components/tasks/interactive-task-card';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useGameState } from '@/hooks/use-game-data';
import type { Task } from "@/types";
import { useTaskNavigation } from "@/context/task-navigation-context";
import { ScenarioForm } from "@/components/ai/scenario-form";
import { AdvisorInsights } from "@/components/ai/advisor-insights";
import { StrategicNotesEditor } from "@/components/ai/strategic-notes-editor";
import { DebriefReportView } from "@/components/ai/debrief-report-view";

export default function ScenarioPlanningPage() {
    const { profile } = useAuth();
    const { tasks, updateTask } = useTasks();
    const { gameState } = useGameState();
    const { activeTaskId, openedTaskId, setOpenedTaskId, getTaskRef } = useTaskNavigation();
    
    const currentRound = gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round || 1;

    const marketingTasks = useMemo(() => {
        if (!profile) return [];
        return tasks.filter(task =>
            task.role === profile.name &&
            task.transactionCode.includes("ZADS") &&
             (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
        ).sort((a,b) => a.priority.localeCompare(b.priority));
    }, [tasks, profile, currentRound]);
    
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
            if(taskRef?.current) {
                taskRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            setOpenedTaskId(null);
        }
    };
    
    const handleTaskUpdate = (updatedTask: Task) => {
        updateTask(updatedTask);
        if (updatedTask.completed && updatedTask.id === activeTaskId) {
            handleFindNextTask(updatedTask.id, marketingTasks);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.6fr_1.2fr]">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl">Sales Scenario Builder</CardTitle>
                        <CardDescription>Model new sales strategies and capture AI guidance without leaving the page.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScenarioForm />
                    </CardContent>
                </Card>
                <div className="space-y-4">
                    <AdvisorInsights />
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <StrategicNotesEditor />
                <DebriefReportView />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Marketing (ZADS)</CardTitle>
                    <CardDescription>Set the advertising spend for each distribution channel for ZADS.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {marketingTasks.map((task) => (
                        <div key={task.id} className="relative pt-6">
                            <InteractiveTaskCard
                                ref={getTaskRef(task.id)}
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
    )
}
