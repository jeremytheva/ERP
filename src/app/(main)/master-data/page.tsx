
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Database, FileText, Users, HardHat } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bom">
                <FileText className="mr-2 h-4 w-4" />
                Bill of Materials (BOM) & Costs
              </TabsTrigger>
              <TabsTrigger value="vendors">
                 <Users className="mr-2 h-4 w-4" />
                Vendor Details
              </TabsTrigger>
              <TabsTrigger value="capacity">
                <HardHat className="mr-2 h-4 w-4" />
                Production Capacity
              </TabsTrigger>
            </TabsList>
            <TabsContent value="bom" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Product Recipes and Costs</CardTitle>
                        <CardDescription>Final cost for every product, used by Sales for pricing.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Placeholder for Bill of Materials and packaging cost data.</p>
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="vendors" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Vendor Lead Times & Costs</CardTitle>
                        <CardDescription>Details for all raw material vendors (Fast, Green, etc.).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Placeholder for vendor master data.</p>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="capacity" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Production Capacity Limits</CardTitle>
                        <CardDescription>Fixed capacity limits for the production plant.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Placeholder for capacity limit data.</p>
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
