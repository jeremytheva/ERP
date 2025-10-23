
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, TrendingUp, AlertTriangle } from "lucide-react";

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
    forecastUnits: number;
    priceStrategy: string;
    priceOffset: number;
    prices: { productId: string; dc: string; price: number; }[];
    marketingBudget: { dc: string; budget: number; }[];
};

export function SalesManagerView({ activeSection }: { activeSection: string }) {

    const { register, control, watch, setValue } = useForm<SalesFormData>({
        defaultValues: {
            competitorAvgPrice: 15.50,
            forecastUnits: 120000,
            priceStrategy: 'below',
            priceOffset: 0.50,
            prices: PRODUCTS.flatMap(p => DCS.map(dc => ({ productId: p.id, dc, price: p.price }))),
            marketingBudget: [
                { dc: "DC10", budget: 40000 },
                { dc: "DC12", budget: 30000 },
                { dc: "DC14", budget: 30000 },
            ]
        }
    });

    const { fields: priceFields } = useFieldArray({ control, name: "prices" });
    const { fields: budgetFields } = useFieldArray({ control, name: "marketingBudget" });

    const watchedCompetitorAvgPrice = watch("competitorAvgPrice");
    const watchedPriceStrategy = watch("priceStrategy");
    const watchedPriceOffset = watch("priceOffset");
    const watchedPrices = watch("prices");

    const totalMarketingSpend = useMemo(() => {
        return watch("marketingBudget").reduce((total, item) => total + item.budget, 0);
    }, [watch]);

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


    if (activeSection === 'market-analysis') {
        return (
            <Card>
                <CardHeader><CardTitle>Market Analysis & Competitor Check</CardTitle><CardDescription>Extract key market data from ZMARKET to drive pricing decisions.</CardDescription></CardHeader>
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

    if (activeSection === 'forecasting') {
        return (
            <Card>
                <CardHeader><CardTitle>Forecasting Input</CardTitle><CardDescription>Calculate and set the total sales forecast for MD61. This will be pushed to the LIT.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                        <div className="space-y-2">
                        <Label htmlFor="forecastUnits">R-N Total Forecast (Units)</Label>
                        <Input id="forecastUnits" type="number" step="1000" {...register("forecastUnits", { valueAsNumber: true })} />
                    </div>
                    <Button>Push Forecast to LIT</Button>
                </CardContent>
            </Card>
        )
    }
    
    if (activeSection === 'pricing') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Pricing Decision Matrix</CardTitle>
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
                                <Select value={watchedPriceStrategy} onValueChange={(val) => setValue('priceStrategy', val)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="below">Price Below</SelectItem>
                                        <SelectItem value="match">Match</SelectItem>
                                        <SelectItem value="above">Price Above</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                            {productFields.map((field, index) => {
                                                const fieldIndex = priceFields.findIndex(f => f.id === field.id);
                                                return(
                                                    <TableCell key={field.id}>
                                                            <Controller
                                                            control={control}
                                                            name={`prices.${fieldIndex}.price`}
                                                            render={({ field: controllerField }) => (
                                                                <Input type="number" step="0.01" {...controllerField} />
                                                            )}
                                                        />
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
        )
    }

    if (activeSection === 'marketing') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Marketing Budget Allocation</CardTitle>
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

    return null;
}
