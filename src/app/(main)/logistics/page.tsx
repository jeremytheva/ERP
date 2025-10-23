
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Banknote, PackageOpen, Ship } from "lucide-react";

export default function LogisticsPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Truck className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-3xl">Logistics Manager View</CardTitle>
              <CardDescription>
                Finished goods transfer, cash flow monitoring, and contingency planning.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="liquidity-check">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="liquidity-check">
                <Banknote className="mr-2 h-4 w-4" />
                Liquidity Check (ZFF7B)
              </TabsTrigger>
              <TabsTrigger value="stock-transfer">
                 <PackageOpen className="mr-2 h-4 w-4" />
                Stock Transfer (ZMB1B)
              </TabsTrigger>
              <TabsTrigger value="delivery-monitoring">
                <Ship className="mr-2 h-4 w-4" />
                Delivery Monitoring (ZME2N)
              </TabsTrigger>
            </TabsList>
            <TabsContent value="liquidity-check" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Liquidity & Cash Flow Check</CardTitle>
                        <CardDescription>Monitor current Cash Balance from ZFF7B.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Content for this section to be built. This section will trigger a red alert if cash is below €100,000.</p>
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="stock-transfer" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Stock Transfer Planning</CardTitle>
                        <CardDescription>Calculate and plan stock transfers to DCs using ZMB1B.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Content for this section to be built. Input target Days of Supply (DOS) to calculate transfer quantities.</p>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="delivery-monitoring" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Delivery & PO Monitoring</CardTitle>
                        <CardDescription>Track incoming raw material deliveries from ZME2N.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Content for this section to be built. Flag late deliveries to Procurement.</p>
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
