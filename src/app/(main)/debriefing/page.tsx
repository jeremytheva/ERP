
"use client";

import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type SalesFormData = {
    forecastUnits: number;
};

export default function DebriefingPage() {
    const { register } = useForm<SalesFormData>({
        defaultValues: {
            forecastUnits: 120000,
        }
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Forecasting (MD61)</CardTitle>
                <CardDescription>Calculate and set the total sales forecast for MD61. This will be pushed to the LIT.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="forecastUnits">R-N Total Forecast (Units)</Label>
                    <Input id="forecastUnits" type="number" step="1000" {...register("forecastUnits", { valueAsNumber: true })} />
                </div>
                <Button>Push Forecast to LIT</Button>
            </CardContent>
        </Card>
    );
}
