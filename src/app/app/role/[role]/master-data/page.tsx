

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Database, Zap, Truck, Factory, Users, Leaf, Clock } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

const productCosts = [
    { sku: "PP-F05", name: "500g Original Muesli", packageCost: 0.3, finalCost: 0.55 },
    { sku: "PP-F15", name: "1kg Original Muesli", packageCost: 0.4, finalCost: 0.82 },
    { sku: "PP-F01", name: "500g Nut Muesli", packageCost: 0.3, finalCost: 2.73 },
    { sku: "PP-F11", name: "1kg Nut Muesli", packageCost: 0.4, finalCost: 5.16 },
    { sku: "PP-F02", name: "500g Blueberry Muesli", packageCost: 0.3, finalCost: 3.68 },
    { sku: "PP-F04", name: "500g Raisin Muesli", packageCost: 0.3, finalCost: 1.65 },
];

const initialInventory = [
    { sku: "PP-F05", name: "500g Original Muesli", location: "Main Warehouse (02)", stock: 4134 },
    { sku: "PP-F15", name: "1kg Original Muesli", location: "Main Warehouse (02)", stock: 17827 },
];

const operationalConstants = [
    { constant: "Production Setup Time", value: "3.2 Days", role: "Production", icon: Clock, description: "Penalty for producing < 48,000 units." },
    { constant: "Stock Transfer Cost", value: "€500 per transfer", role: "Logistics", icon: Truck, description: "Cost for each ZMB1B posting." },
    { constant: "Max Capacity (FG/RM)", value: "250,000 Units/kg", role: "Production/Logistics", icon: Factory, description: "Storage limit for ZMB52." },
];

const vendorLeadTimes = [
     { constant: "Fast Vendor Lead Time", value: "2–3 Days", role: "Procurement", icon: Zap, description: "Fastest delivery time (V01/V02)." },
    { constant: "Slow/Green Vendor Lead Time", value: "1–4 Days", role: "Procurement", icon: Leaf, description: "CO2-friendly, but variable lead time (V11/V12)." },
]

export default function MasterDataPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Database className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-3xl">Reference & Master Data</CardTitle>
              <CardDescription>
                Static reference for fixed parameters like Bill of Materials (BOM), costs, and vendor details.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Product Manufacturing Costs</CardTitle>
                    <CardDescription>The Final Cost (€) is the total cost per unit before margin/profit.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product SKU</TableHead>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Packaging Cost (€)</TableHead>
                            <TableHead>Final Cost (€)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {productCosts.map((product) => (
                            <TableRow key={product.sku}>
                                <TableCell className="font-mono">{product.sku}</TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.packageCost.toFixed(2)}</TableCell>
                                <TableCell>{product.finalCost.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                   </Table>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Initial Inventory Levels (Round 1)</CardTitle>
                    <CardDescription>The company starts with stock for only the two basic Original Muesli products.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product SKU</TableHead>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Stock Location</TableHead>
                            <TableHead>Starting Stock (Units)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialInventory.map((item) => (
                            <TableRow key={item.sku}>
                                <TableCell className="font-mono">{item.sku}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.location}</TableCell>
                                <TableCell>{item.stock.toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                   </Table>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Operational Constants</CardTitle>
                    <CardDescription>Fixed values for the entire simulation.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Constant</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Role Impacted</TableHead>
                             <TableHead>Description</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {operationalConstants.map((item) => (
                            <TableRow key={item.constant}>
                                <TableCell className="font-semibold flex items-center gap-2">
                                    <item.icon className="h-4 w-4 text-muted-foreground" />
                                    {item.constant}
                                </TableCell>
                                <TableCell>{item.value}</TableCell>
                                <TableCell>{item.role}</TableCell>
                                <TableCell>{item.description}</TableCell>
                            </TableRow>
                        ))}
                        {vendorLeadTimes.map((item) => (
                            <TableRow key={item.constant}>
                                <TableCell className="font-semibold flex items-center gap-2">
                                     <item.icon className="h-4 w-4 text-muted-foreground" />
                                    {item.constant}
                                </TableCell>
                                <TableCell>{item.value}</TableCell>
                                <TableCell>{item.role}</TableCell>
                                <TableCell>{item.description}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                   </Table>
                </CardContent>
            </Card>
        </CardContent>
      </Card>
    </div>
  );
}
