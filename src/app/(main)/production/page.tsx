
"use client";

import { useMemo } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileBox, Wrench, PackageCheck, FileSignature, Factory, RefreshCw, Package } from "lucide-react";
import { TaskGroup } from "@/components/tasks/task-group";
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useGameState } from '@/hooks/use-game-data';
import type { Task } from "@/types";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ProductionChart } from "@/components/dashboard/role-charts/production-chart";
import { useTaskNavigation } from '@/context/task-navigation-context';

export default function ProductionPage() {
    const { profile } = useAuth();
    const { tasks, updateTask } = useTasks();
    const { gameState } = useGameState();
    const { activeTaskId, openedTaskId, setOpenedTaskId, getTaskRef } = useTaskNavigation();

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
                <KpiCard title="Capacity Utilization" value={gameState.capacityUtilization} icon={Factory} format="percent" tooltip="Percentage of total production capacity being used." />
                <KpiCard title="Inventory Turnover" value={gameState.inventoryTurnover} icon={RefreshCw} format="number" tooltip="How many times inventory is sold and replaced over a period." />
                <KpiCard title="Inventory Value" value={gameState.inventoryValue} icon={Package} format="currency" tooltip="The total value of inventory on hand." />
            </div>
            
            <ProductionChart history={gameState.kpiHistory} />

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

            <TaskGroup
                title="Planning & Capacity"
                description="Confirm capacity, set lot size strategy, and check for overstock."
                tasks={planningTasks}
                allTasks={tasks}
                currentRound={currentRound}
                openedTaskId={openedTaskId}
                setOpenedTaskId={setOpenedTaskId}
                activeTaskId={activeTaskId}
                getTaskRef={getTaskRef}
                onUpdate={handleTaskUpdate}
                onFindNext={handleFindNextTask}
                titleIcon={<FileBox className="h-6 w-6" />}
            />

            <TaskGroup
                title="MRP (MD01)"
                description="Execute the MRP run after the forecast is finalized."
                tasks={mrpTasks}
                allTasks={tasks}
                currentRound={currentRound}
                openedTaskId={openedTaskId}
                setOpenedTaskId={setOpenedTaskId}
                activeTaskId={activeTaskId}
                getTaskRef={getTaskRef}
                onUpdate={handleTaskUpdate}
                onFindNext={handleFindNextTask}
                titleIcon={<Wrench className="h-6 w-6" />}
            />

            <TaskGroup
                title="Production Release (CO41)"
                description="Final step to release production orders. The output will be logged to the LIT."
                tasks={releaseTasks}
                allTasks={tasks}
                currentRound={currentRound}
                openedTaskId={openedTaskId}
                setOpenedTaskId={setOpenedTaskId}
                activeTaskId={activeTaskId}
                getTaskRef={getTaskRef}
                onUpdate={handleTaskUpdate}
                onFindNext={handleFindNextTask}
                titleIcon={<PackageCheck className="h-6 w-6" />}
            />

            <TaskGroup
                title="BOM Review (ZCS02)"
                description="Track recipe changes for cost or sustainability."
                tasks={bomTasks}
                allTasks={tasks}
                currentRound={currentRound}
                openedTaskId={openedTaskId}
                setOpenedTaskId={setOpenedTaskId}
                activeTaskId={activeTaskId}
                getTaskRef={getTaskRef}
                onUpdate={handleTaskUpdate}
                onFindNext={handleFindNextTask}
                titleIcon={<FileSignature className="h-6 w-6" />}
            />
        </div>
    );
}
