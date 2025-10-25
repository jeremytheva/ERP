

"use client";

import { useMemo, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, PackageOpen, Ship, AlertTriangle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Truck, ListTodo } from 'lucide-react';
import { InteractiveTaskCard } from '@/components/tasks/interactive-task-card';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useGameState } from '@/hooks/use-game-data';
import type { Role, Task } from "@/types";


const FINISHED_GOODS = [
    { dc: 'DC10', currentStock: 15000, forecast: 40000, salesPerDay: 8000 },
    { dc: 'DC12', currentStock: 12000, forecast: 35000, salesPerDay: 7000 },
    { dc: 'DC14', currentStock: 8000, forecast: 25000, salesPerDay: 5000 },
];

type LogisticsFormData = {
    transfers: { dc: string; targetDOS: number; transferQty: number; }[];
    numTransfers: number;
    onTimeDeliveryRate: number;
};

export default function LogisticsPage() {
    const cashBalance = 85000; // Mock data from Key Metrics
    const isCashAlertActive = cashBalance < 100000;
    
    const { profile } = useAuth();
    const { tasks, updateTask } = useTasks();
    const { gameState } = useGameState();
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

    const { control, register, watch, setValue } = useForm<LogisticsFormData>({
        defaultValues: {
            transfers: FINISHED_GOODS.map(fg => ({
                dc: fg.dc,
                targetDOS: 3,
                transferQty: Math.max(0, (3 * fg.salesPerDay) - fg.currentStock)
            })),
            numTransfers: 3,
            onTimeDeliveryRate: 98,
        }
    });

    const { fields: transferFields } = useFieldArray({ control, name: 'transfers' });
    const watchedTransfers = watch('transfers');
    
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

    const handleTaskUpdate = (updatedTask: Task) => {
        updateTask(updatedTask);
    };

    const handleFindNextTask = (currentTaskId: string, taskGroup: Task[]) => {
        const currentIndex = taskGroup.findIndex(t => t.id === currentTaskId);
        if (currentIndex === -1) {
            setActiveTaskId(null);
            return;
        }
        const nextTask = taskGroup.slice(currentIndex + 1).find(t => !t.completed);
        if (nextTask) {
            setActiveTaskId(nextTask.id);
        } else {
            const firstIncompleteTask = taskGroup.find(t => !t.completed && t.id !== currentTaskId);
            setActiveTaskId(firstIncompleteTask ? firstIncompleteTask.id : null);
        }
    };


    const handleDosChange = (index: number, newDos: number) => {
        const fg = FINISHED_GOODS[index];
        if (fg && newDos >= 0) {
            const transferQty = Math.max(0, (newDos * fg.salesPerDay) - fg.currentStock);
            setValue(`transfers.${index}.targetDOS`, newDos);
            setValue(`transfers.${index}.transferQty`, Math.round(transferQty));
        }
    };
    
    const isStockOutRisk = useMemo(() => {
        return FINISHED_GOODS.some(fg => fg.currentStock < 5000);
    }, []);

    return (
        <div className="space-y-6">
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
                            <ListTodo className="h-6 w-6" />
                            <div>
                                <CardTitle>Monitoring Tasks</CardTitle>
                                <CardDescription>Monitor cash flow, deliveries, and stock status.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {monitoringTasks.map(task => (
                            <InteractiveTaskCard
                                key={task.id}
                                task={task}
                                allTasks={tasks}
                                isActive={activeTaskId === task.id}
                                onToggle={() => setActiveTaskId(activeTaskId === task.id ? null : task.id)}
                                onUpdate={handleTaskUpdate}
                                onFindNext={(id) => handleFindNextTask(id, monitoringTasks)}
                            />
                        ))}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Banknote className="h-6 w-6" />
                        <CardTitle>Liquidity Check (ZFF7B)</CardTitle>
                    </div>
                    <CardDescription>Monitor current Cash Balance from ZFF7B.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                        {isCashAlertActive && (
                        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-200">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                <h4 className="font-semibold text-red-100">Red Cash Alert</h4>
                            </div>
                            <p className="pl-7">Cash Balance is below €100,000. Immediately alert Procurement to hold or cancel large POs to prevent overdraft.</p>
                        </div>
                    )}
                    <div className="rounded-lg border bg-secondary/30 p-4 space-y-1">
                        <p className="text-sm text-muted-foreground">Current Cash Balance (from Key Metrics)</p>
                        <p className="text-3xl font-bold">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cashBalance)}</p>
                    </div>
                </CardContent>
            </Card>

            {stockTransferTasks.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <ListTodo className="h-6 w-6" />
                            <div>
                                <CardTitle>Stock Transfer Tasks</CardTitle>
                                <CardDescription>Calculate and plan stock transfers to DCs.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {stockTransferTasks.map(task => (
                            <InteractiveTaskCard
                                key={task.id}
                                task={task}
                                allTasks={tasks}
                                isActive={activeTaskId === task.id}
                                onToggle={() => setActiveTaskId(activeTaskId === task.id ? null : task.id)}
                                onUpdate={handleTaskUpdate}
                                onFindNext={(id) => handleFindNextTask(id, stockTransferTasks)}
                            />
                        ))}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                     <div className="flex items-center gap-3">
                        <PackageOpen className="h-6 w-6" />
                        <CardTitle>Stock Transfer (ZMB1B)</CardTitle>
                    </div>
                    <CardDescription>Calculate and plan stock transfers to DCs using ZMB1B. The Final Transfer Qty will be pushed to the LIT.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isStockOutRisk && (
                        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-200">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                <h4 className="font-semibold text-red-100">Stock Out Risk</h4>
                            </div>
                            <p className="pl-7">At least one DC has less than 5,000 units, increasing the risk of missed sales.</p>
                        </div>
                    )}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>DC</TableHead>
                                <TableHead>Current Stock</TableHead>
                                <TableHead>Target DOS</TableHead>
                                <TableHead>Final Transfer Qty</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transferFields.map((field, index) => {
                                const fg = FINISHED_GOODS[index];
                                return (
                                    <TableRow key={field.id}>
                                        <TableCell>{field.dc}</TableCell>
                                        <TableCell>{fg.currentStock.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Input type="number" min="0" value={watchedTransfers[index].targetDOS} onChange={(e) => handleDosChange(index, parseInt(e.target.value, 10))} />
                                        </TableCell>
                                        <TableCell>
                                            <Input readOnly disabled value={watchedTransfers[index].transferQty.toLocaleString()} />
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                        <div className="flex justify-end">
                        <Button>Push Transfer Qty to LIT (for ZMB1B)</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Ship className="h-6 w-6" />
                        <CardTitle>Delivery Monitoring (ZME2N)</CardTitle>
                    </div>
                    <CardDescription>Track incoming raw material deliveries from ZME2N and log execution data.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                        <div className="rounded-lg border bg-secondary/30 p-4">
                        <p className="font-semibold">PO Delivery Status (from Procurement)</p>
                        <p className="text-sm text-muted-foreground">All POs on schedule. No late deliveries to flag.</p>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="numTransfers">Number of Transfers Executed</Label>
                            <Input id="numTransfers" type="number" {...register('numTransfers', { valueAsNumber: true })} />
                        </div>
                            <div className="space-y-2">
                            <Label htmlFor="onTimeDeliveryRate">On-Time Delivery Rate (%)</Label>
                            <Input id="onTimeDeliveryRate" type="number" {...register('onTimeDeliveryRate', { valueAsNumber: true })} />
                        </div>
                        </div>
                </CardContent>
            </Card>
        </div>
    );
}
