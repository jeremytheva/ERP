
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Percent } from "lucide-react";
import { InteractiveTaskCard } from '@/components/tasks/interactive-task-card';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useGameState } from '@/hooks/use-game-data';
import type { Task } from "@/types";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { SalesChart } from "@/components/dashboard/role-charts/sales-chart";
import { useTaskNavigation } from "@/context/task-navigation-context";

export default function SalesPage() {
    const { profile } = useAuth();
    const { tasks, updateTask } = useTasks();
    const { gameState } = useGameState();
    const { activeTaskId, openedTaskId, setOpenedTaskId, taskRefs } = useTaskNavigation();
    
    const currentRound = gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round || 1;

    const marketAnalysisTasks = useMemo(() => {
        if (!profile) return [];
        return tasks.filter(task =>
            task.role === profile.name &&
            task.transactionCode.includes("ZMARKET") &&
             (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
        ).sort((a,b) => a.priority.localeCompare(b.priority));
    }, [tasks, profile, currentRound]);

    const getTaskRefIndex = (taskId: string) => marketAnalysisTasks.findIndex(t => t.id === taskId);

    const handleFindNextTask = (currentTaskId: string, taskGroup: Task[]) => {
        const currentIndex = taskGroup.findIndex(t => t.id === currentTaskId);
        if (currentIndex === -1) {
            setOpenedTaskId(null);
            return;
        }
        const nextIncompleteTask = taskGroup.slice(currentIndex + 1).find(t => !t.completed);

        if (nextIncompleteTask) {
            setOpenedTaskId(nextIncompleteTask.id);
            const nextTaskIndexInPage = marketAnalysisTasks.findIndex(t => t.id === nextIncompleteTask.id);
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
            handleFindNextTask(updatedTask.id, marketAnalysisTasks);
        }
    };

    return (
        <div className="space-y-6">
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard title="Market Share" value={gameState.marketShare} icon={TrendingUp} format="percent" tooltip="Your company's sales as a percentage of total market sales." />
                <KpiCard title="Average Price Gap" value={gameState.averagePriceGap} icon={DollarSign} format="currency" tooltip="The average difference between your price and the competitor's average price." />
                <KpiCard title="Gross Revenue" value={gameState.grossRevenue} icon={Percent} format="currency" tooltip="Total revenue from sales before subtracting costs." />
            </div>
            
             <SalesChart history={gameState.kpiHistory} />
            
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Market Analysis (ZMARKET)</CardTitle>
                    <CardDescription>Extract key market data from ZMARKET to drive pricing decisions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {marketAnalysisTasks.map((task, index) => (
                        <div key={task.id} className="relative pt-6">
                            <InteractiveTaskCard
                                ref={taskRefs.current[getTaskRefIndex(task.id)]}
                                task={task}
                                allTasks={tasks}
                                isActive={openedTaskId === task.id}
                                isCurrent={activeTaskId === task.id}
                                onToggle={() => setOpenedTaskId(openedTaskId === task.id ? null : task.id)}
                                onUpdate={handleTaskUpdate}
                                onFindNext={(id) => handleFindNextTask(id, marketAnalysisTasks)}
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
