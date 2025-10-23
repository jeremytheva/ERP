
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Package, Users, Truck, Leaf } from "lucide-react";

export default function ProcurementPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-3xl">Procurement Manager View</CardTitle>
              <CardDescription>
                RM sourcing, inventory replenishment, and sustainability investment.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
           <Tabs defaultValue="inventory-check">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="inventory-check">
                <Package className="mr-2 h-4 w-4" />
                Inventory Check (ZMB52)
              </TabsTrigger>
              <TabsTrigger value="sourcing">
                 <Users className="mr-2 h-4 w-4" />
                Sourcing (ZME12)
              </TabsTrigger>
              <TabsTrigger value="order-calculation">
                <Truck className="mr-2 h-4 w-4" />
                Order Calc (ME59N)
              </TabsTrigger>
               <TabsTrigger value="sustainability">
                <Leaf className="mr-2 h-4 w-4" />
                Sustainability (ZFB50)
              </TabsTrigger>
            </TabsList>
            <TabsContent value="inventory-check" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Inventory Check</CardTitle>
                        <CardDescription>Pulls current raw material stock and status from the LIT.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Content for this section to be built. This section will show low stock alerts.</p>
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="sourcing" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Sourcing Decision</CardTitle>
                        <CardDescription>Set the order strategy and vendor selection for each raw material.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Content for this section to be built. Choose between Fast or Green vendors.</p>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="order-calculation" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Calculation</CardTitle>
                        <CardDescription>Calculate the required quantity to order based on MRP forecast and current stock.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Content for this section to be built. Pushes the final PO Qty to the LIT for execution in ME59N.</p>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="sustainability" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Sustainability Investment</CardTitle>
                        <CardDescription>Track sustainability goals and investment amounts for ZFB50.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Content for this section to be built. Input the actual ZFB50 posting amount.</p>
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
