
"use client";

import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info, TrendingUp } from "lucide-react";

type SalesFormData = {
    competitorAvgPrice: number;
};

export default function SalesPage() {

    const { register } = useForm<SalesFormData>({
        defaultValues: {
            competitorAvgPrice: 15.50,
        }
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Market Analysis (ZMARKET)</CardTitle>
                <CardDescription>Extract key market data from ZMARKET to drive pricing decisions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="competitorAvgPrice">Competitor Avg. Price (€)</Label>
                    <Input id="competitorAvgPrice" type="number" step="0.01" {...register("competitorAvgPrice", { valueAsNumber: true })} />
                </div>
                    <div className="rounded-lg border bg-secondary/30 p-4">
                    <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 mt-0.5 text-primary" />
                        <div>
                            <h4 className="font-semibold">Data from Key Metrics</h4>
                            <p className="text-sm text-muted-foreground">
                                Market Share: <strong>25%</strong> <TrendingUp className="inline h-4 w-4 text-green-500" />
                            </p>
                            <p className="text-sm text-muted-foreground">
                                On-Time Delivery: <strong>98%</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
