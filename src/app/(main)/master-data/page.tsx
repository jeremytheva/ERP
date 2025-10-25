
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Database } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

const productCosts = [
    { sku: "PP-F05", name: "500g Original Muesli", packageCost: 0.3, finalCost: 0.55 },
    { sku: "PP-F15", name: "1kg Original Muesli", packageCost: 0.4, finalCost: 0.82 },
    { sku: "PP-F01", name: "500g Nut Muesli", packageCost: 0.3, finalCost: 2.73 },
    { sku: "PP-F11", name: "1kg Nut Muesli", packageCost: 0.4, finalCost: 5.16 },
    { sku: "PP-F02", name: "500g Blueberry Muesli", packageCost: 0.3, finalCost: 3.68 },
    { sku: "PP-F04", name: "500g Raisin Muesli", packageCost: 0.3, finalCost: 1.65 },
];

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
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
