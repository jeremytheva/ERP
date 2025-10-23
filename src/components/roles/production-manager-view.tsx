
"use client";

import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CAPACITY_PER_DAY = 60000; // Units

type ProductionFormData = {
    lotSize: number;
    mrpRun: boolean;
    productionReleased: boolean;
    bomChangeStatus: 'Applied' | 'Pending' | 'N/A';
};

export function ProductionManagerView({ activeSection }: { activeSection: string }) {
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

    if (activeSection === 'planning-capacity') {
        return (
            <Card>
                <CardHeader><CardTitle>Planning & Capacity Check</CardTitle><CardDescription>Confirm capacity, set lot size strategy, and check for overstock.</CardDescription></CardHeader>
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
        )
    }

    if (activeSection === 'mrp') {
        return (
            <Card>
                <CardHeader><CardTitle>Materials Requirements Planning (MRP)</CardTitle><CardDescription>Execute the MRP run after the forecast is finalized.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                        <Checkbox id="mrpRun" {...register("mrpRun")} />
                        <label htmlFor="mrpRun" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Confirm MRP Run (MD01) is complete
                        </label>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (activeSection === 'production-release') {
        return (
            <Card>
                <CardHeader><CardTitle>Production Release Control</CardTitle><CardDescription>Final step to release production orders. The output will be logged to the LIT.</CardDescription></CardHeader>
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
        )
    }

    if (activeSection === 'bom-review') {
        return (
            <Card>
                <CardHeader><CardTitle>Bill of Materials (BOM) Review</CardTitle><CardDescription>Track recipe changes for cost or sustainability.</CardDescription></CardHeader>
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
        )
    }

    return null;
}
