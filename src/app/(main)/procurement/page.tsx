
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Truck, Leaf, DollarSign, Warehouse } from "lucide-react";
import { ShoppingCart, Package } from 'lucide-react';
import { InteractiveTaskCard } from '@/components/tasks/interactive-task-card';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useGameState } from '@/hooks/use-game-data';
import type { Task } from "@/types";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ProcurementChart } from "@/components/dashboard/role-charts/procurement-chart";
import { useTaskNavigation } from '@/context/task-navigation-context';

export default function ProcurementPage() {
    const { profile } = useAuth();
    const { tasks, updateTask } = useTasks();
    const { gameState } = useGameState();
    const { activeTaskId, openedTaskId, setOpenedTaskId, taskRefs } = useTaskNavigation();

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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard title="Cost of Goods Sold" value={gameState.cogs} icon={DollarSign} format="currency" tooltip="The direct costs attributable to the production of the goods sold by a company." />
                <KpiCard title="Warehouse Costs" value={gameState.warehouseCosts} icon={Warehouse} format="currency" tooltip="Total costs associated with storing inventory." />
                <KpiCard title="CO₂e Emissions" value={gameState.cumulativeCO2eEmissions} icon={Leaf} format="number" unit="kg" tooltip="Cumulative CO₂ equivalent emissions from operations." />
            </div>
            
            <ProcurementChart history={gameState.kpiHistory} />

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
                                    isActive={openedTaskId === task.id}
                                    isCurrent={activeTaskId === task.id}
                                    onToggle={() => setOpenedTaskId(openedTaskId === task.id ? null : task.id)}
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
                                    isActive={openedTaskId === task.id}
                                    isCurrent={activeTaskId === task.id}
                                    onToggle={() => setOpenedTaskId(openedTaskId === task.id ? null : task.id)}
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
                                    isActive={openedTaskId === task.id}
                                    isCurrent={activeTaskId === task.id}
                                    onToggle={() => setOpenedTaskId(openedTaskId === task.id ? null : task.id)}
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
                                    isActive={openedTaskId === task.id}
                                    isCurrent={activeTaskId === task.id}
                                    onToggle={() => setOpenedTaskId(openedTaskId === task.id ? null : task.id)}
                                    onUpdate={handleTaskUpdate}
                                    onFindNext={(id) => handleFindNextTask(id, sustainabilityTasks)}
                                />
                             </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
