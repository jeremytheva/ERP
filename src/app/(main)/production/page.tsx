

"use client";

import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileBox, Wrench, PackageCheck, FileSignature, AlertTriangle } from "lucide-react";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Factory } from 'lucide-react';
import { ContextualTaskCard } from '@/components/tasks/contextual-task-card';

const CAPACITY_PER_DAY = 60000; // Units

type ProductionFormData = {
    lotSize: number;
    mrpRun: boolean;
    productionReleased: boolean;
    bomChangeStatus: 'Applied' | 'Pending' | 'N/A';
};

export default function ProductionPage() {
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

    return (
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

            <ContextualTaskCard
                transactionCode="MD01"
                title="MRP Run Tasks"
                description="Execute the MRP run after the forecast is finalized."
            />
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

             <ContextualTaskCard
                transactionCode="CO41 (Production Release)"
                title="Production Release Tasks"
                description="Final step to release production orders."
            />
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

             <ContextualTaskCard
                transactionCode="ZCS02"
                title="BOM Review Tasks"
                description="Track and apply recipe changes."
            />
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
    );
}
