
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, PackageOpen, HandCoins, Warehouse, ShipWheel } from "lucide-react";
import { Truck } from 'lucide-react';
import { InteractiveTaskCard } from '@/components/tasks/interactive-task-card';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useGameState } from '@/hooks/use-game-data';
import type { Task } from "@/types";
import { KpiCard } from "@/components/kpi-card";
import { LogisticsChart } from "@/components/dashboard/role-charts/logistics-chart";
import { useTaskNavigation } from '@/context/task-navigation-context';

export default function LogisticsPage() {
    const { gameState } = useGameState();
    const { profile } = useAuth();
    const { tasks, updateTask } = useTasks();
    const { activeTaskId, openedTaskId, setOpenedTaskId, getTaskRef } = useTaskNavigation();

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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard title="Cash Balance" value={gameState.cashBalance} icon={HandCoins} format="currency" tooltip="The total amount of cash your company has on hand." />
                <KpiCard title="On-Time Delivery Rate" value={gameState.onTimeDeliveryRate} icon={ShipWheel} format="percent" tooltip="The percentage of orders delivered to customers on time." />
                <KpiCard title="Warehouse Costs" value={gameState.warehouseCosts} icon={Warehouse} format="currency" tooltip="Total costs associated with storing inventory." />
            </div>
            
            <LogisticsChart history={gameState.kpiHistory} />

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
                                    ref={getTaskRef(task.id)}
                                    task={task}
                                    allTasks={tasks}
                                    isActive={openedTaskId === task.id}
                                    isCurrent={activeTaskId === task.id}
                                    onToggle={() => setOpenedTaskId(openedTaskId === task.id ? null : task.id)}
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
                                    ref={getTaskRef(task.id)}
                                    task={task}
                                    allTasks={tasks}
                                    isActive={openedTaskId === task.id}
                                    isCurrent={activeTaskId === task.id}
                                    onToggle={() => setOpenedTaskId(openedTaskId === task.id ? null : task.id)}
                                    onUpdate={handleTaskUpdate}
                                    onFindNext={(id) => handleFindNextTask(id, stockTransferTasks)}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
