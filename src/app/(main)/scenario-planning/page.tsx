
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const DCS = ["DC10", "DC12", "DC14"];

type SalesFormData = {
    marketingBudget: { dc: string; budget: number; }[];
};

export default function ScenarioPlanningPage() {
    const { control, watch } = useForm<SalesFormData>({
        defaultValues: {
            marketingBudget: [
                { dc: "DC10", budget: 40000 },
                { dc: "DC12", budget: 30000 },
                { dc: "DC14", budget: 30000 },
            ]
        }
    });

    const { fields: budgetFields } = useFieldArray({ control, name: "marketingBudget" });

    const totalMarketingSpend = useMemo(() => {
        return watch("marketingBudget").reduce((total, item) => total + item.budget, 0);
    }, [watch]);


    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Marketing (ZADS)</CardTitle>
                <CardDescription>Set the advertising spend for each distribution channel for ZADS.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    {budgetFields.map((field, index) => (
                        <div key={field.id} className="space-y-2">
                            <Label>Ad Spend for {field.dc} (€)</Label>
                            <Controller
                                control={control}
                                name={`marketingBudget.${index}.budget`}
                                render={({ field: controllerField }) => (
                                    <>
                                        <Slider
                                            value={[controllerField.value]}
                                            onValueChange={(vals) => controllerField.onChange(vals[0])}
                                            min={0}
                                            max={100000}
                                            step={1000}
                                        />
                                        <div className="text-right text-sm text-muted-foreground">
                                            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(controllerField.value)}
                                        </div>
                                    </>
                                )}
                            />
                        </div>
                    ))}
                </div>
                <CardFooter className="flex-col items-start p-0 pt-4">
                    <p className="font-semibold">Total Marketing Spend: {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(totalMarketingSpend)}</p>
                    <div className="flex justify-end w-full mt-4">
                        <Button>Save Budget to SAP (ZADS)</Button>
                    </div>
                </CardFooter>
            </CardContent>
        </Card>
    )
}
