
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Factory, Wrench, PackageCheck, FileBox } from "lucide-react";

export default function ProductionPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Factory className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-3xl">Production Manager View</CardTitle>
              <CardDescription>
                Capacity, efficiency, BOM, and production release management.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
           <Tabs defaultValue="planning-capacity">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="planning-capacity">
                <FileBox className="mr-2 h-4 w-4" />
                Planning & Capacity
              </TabsTrigger>
              <TabsTrigger value="mrp">
                 <Wrench className="mr-2 h-4 w-4" />
                MRP (MD01)
              </TabsTrigger>
              <TabsTrigger value="production-release">
                <PackageCheck className="mr-2 h-4 w-4" />
                Production Release (CO41)
              </TabsTrigger>
               <TabsTrigger value="bom-review">
                <FileSignature className="mr-2 h-4 w-4" />
                BOM Review (ZCS02)
              </TabsTrigger>
            </TabsList>
            <TabsContent value="planning-capacity" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Planning & Capacity Check</CardTitle>
                        <CardDescription>Confirm capacity and set lot size strategy.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Content for this section to be built. Pulls sales target from LIT and checks against capacity.</p>
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="mrp" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Materials Requirements Planning (MRP)</CardTitle>
                        <CardDescription>Execute the MRP run after the forecast is finalized.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Content for this section to be built. Includes a checklist to confirm MD01 execution.</p>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="production-release" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Production Release Control</CardTitle>
                        <CardDescription>Final step to release production orders.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Content for this section to be built. Includes a checklist for CO41 and logs units to convert to LIT.</p>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="bom-review" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Bill of Materials (BOM) Review</CardTitle>
                        <CardDescription>Track recipe changes for cost or sustainability.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Content for this section to be built. Set status for BOM changes (ZCS02).</p>
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
