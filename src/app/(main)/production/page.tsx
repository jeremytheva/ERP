

"use client";

import { useMemo, useState, useRef, useEffect, createRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileBox, Wrench, PackageCheck, FileSignature, AlertTriangle, ListTodo, LocateFixed } from "lucide-react";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Factory } from 'lucide-react';
import { InteractiveTaskCard } from '@/components/tasks/interactive-task-card';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useGameState } from '@/hooks/use-game-data';
import type { Role, Task } from "@/types";


const CAPACITY_PER_DAY = 60000; // Units

type ProductionFormData = {
    lotSize: number;
    mrpRun: boolean;
    productionReleased: boolean;
    bomChangeStatus: 'Applied' | 'Pending' | 'N/A';
};

export default function ProductionPage() {
    const { profile } = useAuth();
    const { tasks, updateTask } = useTasks();
    const { gameState } = useGameState();
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

    const { register, control, watch } = useForm<ProductionFormData>({
        defaultValues: {
            lotSize: 48000,
            mrpRun: false,
            productionReleased: false,
            bomChangeStatus: 'N/A',
        }
    });

    // Mock sales forecast from LIT
    const salesForecast = 120000;
    const capacityUtilization = (salesForecast / (CAPACITY_PER_DAY * 5)) * 100;
    const watchedLotSize = watch('lotSize');
    const efficiencyAlert = watchedLotSize < 48000;
    
    const currentRound = gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round || 1;

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

    const allTasksForPage = useMemo(() => [...mrpTasks, ...releaseTasks, ...bomTasks], [mrpTasks, releaseTasks, bomTasks]);
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
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <FileBox className="h-6 w-6" />
                            <CardTitle>Planning & Capacity</CardTitle>
                        </div>
                        <CardDescription>Confirm capacity, set lot size strategy, and check for overstock.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {efficiencyAlert && (
                            <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-200">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    <h4 className="font-semibold text-amber-100">Efficiency Alert</h4>
                                </div>
                                <p className="pl-7">Lot size is less than 48,000 units, which will result in higher setup costs and lower efficiency.</p>
                            </div>
                        )}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="rounded-lg border bg-secondary/30 p-4 space-y-1">
                                <p className="text-sm text-muted-foreground">Sales Forecast (from LIT)</p>
                                <p className="text-2xl font-bold">{salesForecast.toLocaleString()} units</p>
                            </div>
                                <div className="rounded-lg border bg-secondary/30 p-4 space-y-1">
                                <p className="text-sm text-muted-foreground">Capacity Utilization</p>
                                <p className="text-2xl font-bold">{capacityUtilization.toFixed(0)}%</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lotSize">Production Lot Size Strategy</Label>
                            <Input id="lotSize" type="number" step="1000" {...register("lotSize", { valueAsNumber: true })} />
                        </div>
                    </CardContent>
                </Card>

                {mrpTasks.length > 0 && (
                     <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <ListTodo className="h-6 w-6" />
                                <div>
                                    <CardTitle>MRP Run Tasks</CardTitle>
                                    <CardDescription>Execute the MRP run after the forecast is finalized.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {mrpTasks.map(task => (
                                 <InteractiveTaskCard
                                    key={task.id}
                                    ref={taskRefs.current[getTaskRefIndex(task.id)]}
                                    task={task}
                                    allTasks={tasks}
                                    isActive={activeTaskId === task.id}
                                    onToggle={() => setActiveTaskId(activeTaskId === task.id ? null : task.id)}
                                    onUpdate={handleTaskUpdate}
                                    onFindNext={(id) => handleFindNextTask(id, mrpTasks)}
                                />
                            ))}
                        </CardContent>
                    </Card>
                )}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Wrench className="h-6 w-6" />
                            <CardTitle>MRP (MD01)</CardTitle>
                        </div>
                        <CardDescription>Execute the MRP run after the forecast is finalized.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                            <Checkbox id="mrpRun" {...register("mrpRun")} />
                            <label htmlFor="mrpRun" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Confirm MRP Run (MD01) is complete
                            </label>
                        </div>
                    </CardContent>
                </Card>

                {releaseTasks.length > 0 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <ListTodo className="h-6 w-6" />
                                <div>
                                    <CardTitle>Production Release Tasks</CardTitle>
                                    <CardDescription>Final step to release production orders.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {releaseTasks.map(task => (
                                 <InteractiveTaskCard
                                    key={task.id}
                                    ref={taskRefs.current[getTaskRefIndex(task.id)]}
                                    task={task}
                                    allTasks={tasks}
                                    isActive={activeTaskId === task.id}
                                    onToggle={() => setActiveTaskId(activeTaskId === task.id ? null : task.id)}
                                    onUpdate={handleTaskUpdate}
                                    onFindNext={(id) => handleFindNextTask(id, releaseTasks)}
                                />
                            ))}
                        </CardContent>
                    </Card>
                )}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <PackageCheck className="h-6 w-6" />
                            <CardTitle>Production Release (CO41)</CardTitle>
                        </div>
                        <CardDescription>Final step to release production orders. The output will be logged to the LIT.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                            <Checkbox id="productionReleased" {...register("productionReleased")} />
                            <label htmlFor="productionReleased" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Confirm Production Release (CO41) is complete
                            </label>
                        </div>
                        <div className="flex justify-end">
                            <Button>Push Units to LIT Log</Button>
                        </div>
                    </CardContent>
                </Card>

                {bomTasks.length > 0 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <ListTodo className="h-6 w-6" />
                                <div>
                                    <CardTitle>BOM Review Tasks</CardTitle>
                                    <CardDescription>Track and apply recipe changes.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {bomTasks.map(task => (
                                 <InteractiveTaskCard
                                    key={task.id}
                                    ref={taskRefs.current[getTaskRefIndex(task.id)]}
                                    task={task}
                                    allTasks={tasks}
                                    isActive={activeTaskId === task.id}
                                    onToggle={() => setActiveTaskId(activeTaskId === task.id ? null : task.id)}
                                    onUpdate={handleTaskUpdate}
                                    onFindNext={(id) => handleFindNextTask(id, bomTasks)}
                                />
                            ))}
                        </CardContent>
                    </Card>
                )}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <FileSignature className="h-6 w-6" />
                            <CardTitle>BOM Review (ZCS02)</CardTitle>
                        </div>
                        <CardDescription>Track recipe changes for cost or sustainability.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Status of Validated BOM Change (ZCS02)</Label>
                            <Controller
                                control={control}
                                name="bomChangeStatus"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="N/A">N/A</SelectItem>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                            <SelectItem value="Applied">Applied</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
