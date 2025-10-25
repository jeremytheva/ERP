
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Database, FileText, Users, HardHat, Target } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

const kpiTargets = [
    { metric: "Production Efficiency", value: "90%", notes: "Target utilization rate." },
    { metric: "On-Time Delivery Rate", value: "95%", notes: "Target rate for customer deliveries." },
    { metric: "Inventory Turnover Ratio", value: "8 times/year", notes: "Inventory efficiency goal." },
    { metric: "Quality Control Metrics", value: "< 2%", notes: "Target defect rate." },
    { metric: "Lead Time", value: "5 Days", notes: "Target customer lead time." },
    { metric: "Cost per Unit", value: "€50", notes: "Target manufacturing cost per unit." },
    { metric: "Cash Alert Trigger", value: "< €100,000", notes: "Critical alert level for cash flow." },
];

const productCosts = [
    { sku: "PP-F05", name: "500g Original Muesli", packageCost: 0.3, finalCost: 0.55 },
    { sku: "PP-F15", name: "1kg Original Muesli", packageCost: 0.4, finalCost: 0.82 },
    { sku: "PP-F01", name: "500g Nut Muesli", packageCost: 0.3, finalCost: 2.73 },
    { sku: "PP-F11", name: "1kg Nut Muesli", packageCost: 0.4, finalCost: 5.16 },
    { sku: "PP-F02", name: "500g Blueberry Muesli", packageCost: 0.3, finalCost: 3.68 },
    { sku: "PP-F04", name: "500g Raisin Muesli", packageCost: 0.3, finalCost: 1.65 },
];

const fixedConstants = [
    { metric: "Maximum FG Storage Capacity", value: "250,000", unit: "Units", notes: "Main Warehouse (Sloc 2) limit." },
    { metric: "Maximum RM Storage Capacity", value: "250,000", unit: "kg", notes: "Raw Material storage limit." },
    { metric: "Production Setup Time", value: "3.2", unit: "Days", notes: "Setup time per production order." },
];

const transferCosts = [
    { metric: "Stock Transfer Cost", value: "€500", unit: "Per transfer", notes: "Main Warehouse to DC transfer cost (ZMB1B)." },
    { metric: "Stock Transfer CO₂e", value: "750", unit: "kg CO₂e", notes: "Carbon cost per transfer." },
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
        <CardContent>
          <Tabs defaultValue="bom">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="bom">
                <FileText className="mr-2 h-4 w-4" />
                BOM & Costs
              </TabsTrigger>
               <TabsTrigger value="capacity">
                <HardHat className="mr-2 h-4 w-4" />
                Production & Storage
              </TabsTrigger>
              <TabsTrigger value="vendors">
                 <Users className="mr-2 h-4 w-4" />
                Logistics & Vendors
              </TabsTrigger>
              <TabsTrigger value="kpi-targets">
                <Target className="mr-2 h-4 w-4" />
                KPI Targets
              </TabsTrigger>
            </TabsList>
            <TabsContent value="bom" className="mt-6">
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
            </TabsContent>
            <TabsContent value="capacity" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Production & Storage Capacity</CardTitle>
                        <CardDescription>Fixed capacity limits for production and storage.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Metric</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead>Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fixedConstants.map((item) => (
                                    <TableRow key={item.metric}>
                                        <TableCell>{item.metric}</TableCell>
                                        <TableCell>{item.value}</TableCell>
                                        <TableCell>{item.unit}</TableCell>
                                        <TableCell>{item.notes}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="vendors" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Logistics Costs & Vendor Details</CardTitle>
                        <CardDescription>Costs associated with logistics and vendor-specific data.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Metric</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead>Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transferCosts.map((item) => (
                                    <TableRow key={item.metric}>
                                        <TableCell>{item.metric}</TableCell>
                                        <TableCell>{item.value}</TableCell>
                                        <TableCell>{item.unit}</TableCell>
                                        <TableCell>{item.notes}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="kpi-targets" className="mt-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Key Performance Indicator (KPI) Targets</CardTitle>
                        <CardDescription>Strategic goals set for the team to achieve during the simulation.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Metric</TableHead>
                                    <TableHead>Target Value</TableHead>
                                    <TableHead>Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {kpiTargets.map((kpi) => (
                                    <TableRow key={kpi.metric}>
                                        <TableCell>{kpi.metric}</TableCell>
                                        <TableCell>{kpi.value}</TableCell>
                                        <TableCell>{kpi.notes}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

