
"use client";

import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, Truck, Leaf, AlertTriangle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';

const RAW_MATERIALS = [
    { id: 'RM-01', name: 'Wheat', stock: 6000, required: 12000, vendor: 'v01' },
    { id: 'RM-02', name: 'Oats', stock: 4500, required: 15000, vendor: 'v01' },
    { id: 'RM-03', name: 'Nuts', stock: 8000, required: 9000, vendor: 'v11' },
    { id: 'RM-04', name: 'Raisins', stock: 7000, required: 7500, vendor: 'v01' },
    { id: 'RM-05', name: 'Blueberries', stock: 2000, required: 5000, vendor: 'v11' },
    { id: 'RM-06', name: 'Strawberries', stock: 11000, required: 6000, vendor: 'v01' },
];

const PACKAGING_MATERIALS = [
    { id: 'PKG-01', name: 'Small Bag', vendor: 'v02'},
    { id: 'PKG-02', name: 'Large Bag', vendor: 'v02'},
    { id: 'PKG-03', name: 'Small Box', vendor: 'v02'},
    { id: 'PKG-04', name: 'Large Box', vendor: 'v02'},
]

type ProcurementFormData = {
    sourcing: { materialId: string; vendor: 'v01' | 'v11' }[];
    packagingSourcing: { materialId: string; vendor: 'v02' | 'v12' }[];
    orders: { materialId: string; orderQty: number }[];
    sustainabilityInvestment: number;
};

export function ProcurementManagerView({ activeSection }: { activeSection: string }) {
    const { register, control, watch } = useForm<ProcurementFormData>({
        defaultValues: {
            sourcing: RAW_MATERIALS.map(rm => ({ materialId: rm.id, vendor: rm.vendor as 'v01' | 'v11' })),
            packagingSourcing: PACKAGING_MATERIALS.map(pkg => ({ materialId: pkg.id, vendor: pkg.vendor as 'v02' | 'v12'})),
            orders: RAW_MATERIALS.map(rm => ({ materialId: rm.id, orderQty: Math.max(0, rm.required - rm.stock) })),
            sustainabilityInvestment: 50000,
        }
    });

    const { fields: sourcingFields } = useFieldArray({ control, name: 'sourcing' });
    const { fields: packagingSourcingFields } = useFieldArray({ control, name: 'packagingSourcing'});
    const { fields: orderFields } = useFieldArray({ control, name: 'orders' });
    
    if (activeSection === 'inventory-check') {
        return (
            <Card>
                <CardHeader><CardTitle>Inventory Check</CardTitle><CardDescription>Pulls current raw material stock and status from the LIT.</CardDescription></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Material</TableHead>
                                <TableHead>Current Stock (kg)</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {RAW_MATERIALS.map(rm => (
                                <TableRow key={rm.id}>
                                    <TableCell>{rm.name}</TableCell>
                                    <TableCell>{rm.stock.toLocaleString()}</TableCell>
                                    <TableCell>
                                        {rm.stock < 5000 ? 
                                            <span className="flex items-center text-red-500"><AlertTriangle className="h-4 w-4 mr-2" /> Low Stock</span> : 
                                            <span className="text-green-500">OK</span>}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )
    }

    if (activeSection === 'sourcing') {
        return (
            <Card>
                <CardHeader><CardTitle>Sourcing Decision</CardTitle><CardDescription>Set the order strategy and vendor selection for each raw material.</CardDescription></CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h4 className="font-medium mb-2">Raw Material Sourcing</h4>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Material</TableHead>
                                    <TableHead>Vendor Selection</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sourcingFields.map((field, index) => {
                                    const material = RAW_MATERIALS.find(rm => rm.id === field.materialId);
                                    return (
                                        <TableRow key={field.id}>
                                            <TableCell>{material?.name}</TableCell>
                                            <TableCell>
                                                <Controller
                                                    control={control}
                                                    name={`sourcing.${index}.vendor`}
                                                    render={({ field: controllerField }) => (
                                                        <Select onValueChange={controllerField.onChange} value={controllerField.value}>
                                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="v01">Fast Vendors (V01)</SelectItem>
                                                                <SelectItem value="v11">Green Vendors (V11)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                        <div>
                        <h4 className="font-medium mb-2">Packaging Sourcing</h4>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Material</TableHead>
                                    <TableHead>Vendor Selection</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {packagingSourcingFields.map((field, index) => {
                                    const material = PACKAGING_MATERIALS.find(rm => rm.id === field.materialId);
                                    return (
                                        <TableRow key={field.id}>
                                            <TableCell>{material?.name}</TableCell>
                                            <TableCell>
                                                <Controller
                                                    control={control}
                                                    name={`packagingSourcing.${index}.vendor`}
                                                    render={({ field: controllerField }) => (
                                                        <Select onValueChange={controllerField.onChange} value={controllerField.value}>
                                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="v02">Packaging Vendors (V02)</SelectItem>
                                                                <SelectItem value="v12">Packaging-Green Vendors (V12)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (activeSection === 'order-calculation') {
        return (
            <Card>
                <CardHeader><CardTitle>Order Calculation</CardTitle><CardDescription>Calculate the required quantity to order based on MRP forecast and current stock.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Material</TableHead>
                                <TableHead>Required (kg)</TableHead>
                                <TableHead>Current Stock (kg)</TableHead>
                                <TableHead>Final PO Qty (kg)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orderFields.map((field, index) => {
                                    const material = RAW_MATERIALS.find(rm => rm.id === field.materialId);
                                    return (
                                    <TableRow key={field.id}>
                                        <TableCell>{material?.name}</TableCell>
                                        <TableCell>{material?.required.toLocaleString()}</TableCell>
                                        <TableCell>{material?.stock.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Input type="number" step="100" {...register(`orders.${index}.orderQty`, { valueAsNumber: true })} />
                                        </TableCell>
                                    </TableRow>
                                    )
                            })}
                        </TableBody>
                    </Table>
                    <div className="flex justify-end">
                        <Button>Push PO Qty to LIT (for ME59N)</Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (activeSection === 'sustainability') {
        return (
            <Card>
                <CardHeader><CardTitle>Sustainability Investment</CardTitle><CardDescription>Track sustainability goals and investment amounts for ZFB50.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="sustainabilityInvestment">Actual ZFB50 Posting (€)</Label>
                        <Input id="sustainabilityInvestment" type="number" step="1000" {...register("sustainabilityInvestment", { valueAsNumber: true })} />
                    </div>
                        <div className="flex justify-end">
                        <Button>Save Investment</Button>
                    </div>
                </CardContent>
            </Card>
        )
    }
    
    return null;
}
