
"use client";

import { useMemo, useState, useRef, useEffect, createRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, ListTodo, Lightbulb, LocateFixed } from "lucide-react";
import { InteractiveTaskCard } from '@/components/tasks/interactive-task-card';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useGameState } from '@/hooks/use-game-data';
import type { Task, Role } from "@/types";
import { useTeamSettings } from "@/hooks/use-team-settings";


const PRODUCTS = [
    { id: "P-01", name: "Plain Muesli", price: 12.45 },
    { id: "P-02", name: "Nut Muesli", price: 14.95 },
    { id: "P-03", name: "Raisin Muesli", price: 13.45 },
    { id: "P-04", name: "Original Muesli", price: 15.95 },
    { id: "P-05", name: "Blueberry Muesli", price: 16.95 },
    { id: "P-06", name: "Strawberry Muesli", price: 15.45 },
];

const DCS = ["DC10", "DC12", "DC14"];

type SalesFormData = {
    competitorAvgPrice: number;
    priceStrategy: string;
    priceOffset: number;
    prices: { productId: string; dc: string; price: number; }[];
};

export default function StrategicAdvisorPage() {
    const { control, watch, setValue, register } = useForm<SalesFormData>({
        defaultValues: {
            competitorAvgPrice: 15.50,
            priceStrategy: 'below',
            priceOffset: 0.50,
            prices: PRODUCTS.flatMap(p => DCS.map(dc => ({ productId: p.id, dc, price: p.price }))),
        }
    });

    const { fields: priceFields } = useFieldArray({ control, name: "prices" });

    const watchedCompetitorAvgPrice = watch("competitorAvgPrice");
    const watchedPriceStrategy = watch("priceStrategy");
    const watchedPriceOffset = watch("priceOffset");
    const watchedPrices = watch("prices");

    const handleBulkPriceUpdate = () => {
        const basePrice = watchedCompetitorAvgPrice;
        const offset = watchedPriceOffset;
        const strategy = watchedPriceStrategy;

        PRODUCTS.forEach(product => {
            DCS.forEach(dc => {
                const fieldIndex = priceFields.findIndex(f => f.productId === product.id && f.dc === dc);
                if (fieldIndex !== -1) {
                    let newPrice;
                    if (strategy === 'match') {
                        newPrice = basePrice;
                    } else if (strategy === 'above') {
                        newPrice = basePrice + offset;
                    } else {
                        newPrice = basePrice - offset;
                    }
                    setValue(`prices.${fieldIndex}.price`, parseFloat(newPrice.toFixed(2)));
                }
            });
        });
    };
    
    const priceAlert = useMemo(() => {
        return watchedPrices.some(p => p.price > watchedCompetitorAvgPrice * 1.10);
    }, [watchedPrices, watchedCompetitorAvgPrice]);

    const { profile } = useAuth();
    const { tasks, updateTask } = useTasks();
    const { gameState } = useGameState();
    const { teamLeader } = useTeamSettings();
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
                                <InteractiveTaskCard
                                    key={task.id}
                                    ref={taskRefs.current[getTaskRefIndex(task.id)]}
                                    task={task}
                                    allTasks={tasks}
                                    isActive={activeTaskId === task.id}
                                    onToggle={() => setActiveTaskId(activeTaskId === task.id ? null : task.id)}
                                    onUpdate={handleTaskUpdate}
                                    onFindNext={(id) => handleFindNextTask(id, strategyTasks)}
                                />
                            ))}
                        </CardContent>
                    </Card>
                )}

                {pricingTasks.length > 0 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <ListTodo className="h-6 w-6" />
                                <div>
                                    <CardTitle>Pricing Tasks (VK32)</CardTitle>
                                    <CardDescription>Execute pricing strategy tasks.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {pricingTasks.map(task => (
                                <InteractiveTaskCard
                                    key={task.id}
                                    ref={taskRefs.current[getTaskRefIndex(task.id)]}
                                    task={task}
                                    allTasks={tasks}
                                    isActive={activeTaskId === task.id}
                                    onToggle={() => setActiveTaskId(activeTaskId === task.id ? null : task.id)}
                                    onUpdate={handleTaskUpdate}
                                    onFindNext={(id) => handleFindNextTask(id, pricingTasks)}
                                />
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
                    <CardContent className="space-y-6">
                        {priceAlert && (
                            <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-200">
                                <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                <h4 className="font-semibold text-amber-100">Price Alert</h4>
                                </div>
                                <p className="pl-7">At least one product's price is more than 10% above the competitor average, which may reduce sales.</p>
                            </div>
                        )}
                        <Card className="bg-muted/30">
                            <CardHeader><CardTitle className="text-lg">Pricing Strategy</CardTitle></CardHeader>
                            <CardContent className="grid sm:grid-cols-3 gap-4 items-end">
                                <div className="space-y-2">
                                    <Label>Strategy</Label>
                                    <Controller
                                        control={control}
                                        name="priceStrategy"
                                        render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="below">Price Below</SelectItem>
                                                <SelectItem value="match">Match</SelectItem>
                                                <SelectItem value="above">Price Above</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priceOffset">Offset (€)</Label>
                                    <Input id="priceOffset" type="number" step="0.01" {...register("priceOffset", { valueAsNumber: true })} />
                                </div>
                                <Button onClick={handleBulkPriceUpdate}>Apply Strategy</Button>
                            </CardContent>
                        </Card>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        {DCS.map(dc => <TableHead key={dc}>{dc} Price</TableHead>)}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {PRODUCTS.map(product => {
                                        const productFields = priceFields.filter(f => f.productId === product.id);
                                        return (
                                                <TableRow key={product.id}>
                                                <TableCell className="font-medium">{product.name}</TableCell>
                                                {DCS.map(dc => {
                                                    const field = productFields.find(f => f.dc === dc);
                                                    const fieldIndex = priceFields.findIndex(f => f.id === field?.id);
                                                    
                                                    return (
                                                        <TableCell key={`${product.id}-${dc}`}>
                                                            {fieldIndex !== -1 ? (
                                                                <Controller
                                                                control={control}
                                                                name={`prices.${fieldIndex}.price`}
                                                                render={({ field: controllerField }) => (
                                                                    <Input type="number" step="0.01" {...controllerField} />
                                                                )}
                                                            />
                                                            ) : (
                                                                <Input type="number" step="0.01" disabled />
                                                            )}
                                                        </TableCell>
                                                    )
                                                })}
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                            <div className="flex justify-end">
                            <Button>Save Prices to SAP (VK32)</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
