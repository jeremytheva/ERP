
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, BarChart, FileSignature, CircleDollarSign, Megaphone } from "lucide-react";

export default function SalesPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Briefcase className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-3xl">Sales Manager View</CardTitle>
              <CardDescription>
                Forecasting, pricing, and marketing budget management.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="market-analysis">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="market-analysis">
                <BarChart className="mr-2 h-4 w-4" />
                Market Analysis (ZMARKET)
              </TabsTrigger>
              <TabsTrigger value="forecasting">
                 <FileSignature className="mr-2 h-4 w-4" />
                Forecasting (MD61)
              </TabsTrigger>
              <TabsTrigger value="pricing">
                <CircleDollarSign className="mr-2 h-4 w-4" />
                Pricing (VK32)
              </TabsTrigger>
               <TabsTrigger value="marketing">
                <Megaphone className="mr-2 h-4 w-4" />
                Marketing (ZADS)
              </TabsTrigger>
            </TabsList>
            <TabsContent value="market-analysis" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Market Analysis & Competitor Check</CardTitle>
                        <CardDescription>Extract key market data from ZMARKET.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Content for this section to be built. Enter Competitor Avg. Price to drive pricing calculations.</p>
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="forecasting" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Forecasting Input</CardTitle>
                        <CardDescription>Calculate and set the total sales forecast for MD61.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Content for this section to be built. Final forecast will be pushed to the LIT.</p>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="pricing" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Pricing Decision Matrix</CardTitle>
                        <CardDescription>Set the final price for all products for VK32.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Content for this section to be built. Set price strategy relative to competitor average.</p>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="marketing" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Marketing Budget Allocation</CardTitle>
                        <CardDescription>Set the advertising spend for each distribution channel for ZADS.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Content for this section to be built. Input final ad spend for each DC.</p>
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
