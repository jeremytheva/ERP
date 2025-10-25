
"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, ListTodo } from "lucide-react";
import { InteractiveTaskCard } from '@/components/tasks/interactive-task-card';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useGameState } from '@/hooks/use-game-data';
import type { Task } from "@/types";

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
                        newPrice = base-price;
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
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    
    const currentRound = gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round || 1;

    const pricingTasks = useMemo(() => {
        if (!profile) return [];
        return tasks.filter(task =>
            task.role === profile.name &&
            task.transactionCode.includes("VK32") &&
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

    return (
        <div className="space-y-6">
            {pricingTasks.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <ListTodo className="h-6 w-6" />
                            <div>
                                <CardTitle>Pricing Tasks</CardTitle>
                                <CardDescription>Execute pricing strategy tasks for VK32.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {pricingTasks.map(task => (
                            <InteractiveTaskCard
                                key={task.id}
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
                    <CardTitle className="font-headline text-3xl">Pricing (VK32)</CardTitle>
                    <CardDescription>Set the final price for all products for VK32. Use the strategy tool to set prices relative to the competitor average.</CardDescription>
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
    )
}
