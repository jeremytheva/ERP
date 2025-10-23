
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";

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
    const { control, watch, setValue } = useForm<SalesFormData>({
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

    return (
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
                            <Input id="priceOffset" type="number" step="0.01" {...control.register("priceOffset", { valueAsNumber: true })} />
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
                                        {productFields.map((field) => {
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
