
"use client";

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, ShoppingCart, Factory, Truck, Crown, Banknote, PackageOpen, Ship, BarChart, FileSignature, CircleDollarSign, Megaphone, Wrench, PackageCheck, FileBox, Leaf, Users, Package } from "lucide-react";

export default function RolesPage() {
    const searchParams = useSearchParams()
    const defaultTab = searchParams.get('tab') || 'sales';
    const defaultSection = searchParams.get('section');
    
    // State to manage active tabs to ensure URL params are reflected in the UI
    const [activeRoleTab, setActiveRoleTab] = useState(defaultTab);
    const [activeSectionTab, setActiveSectionTab] = useState<string | null>(defaultSection);

    useEffect(() => {
        setActiveRoleTab(defaultTab);
        setActiveSectionTab(defaultSection);
    }, [defaultTab, defaultSection]);


  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue={activeRoleTab} value={activeRoleTab} onValueChange={setActiveRoleTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-5">
            <TabsTrigger value="sales"><Briefcase className="mr-2 h-4 w-4" />Sales</TabsTrigger>
            <TabsTrigger value="production"><Factory className="mr-2 h-4 w-4" />Production</TabsTrigger>
            <TabsTrigger value="procurement"><ShoppingCart className="mr-2 h-4 w-4" />Procurement</TabsTrigger>
            <TabsTrigger value="logistics"><Truck className="mr-2 h-4 w-4" />Logistics</TabsTrigger>
            <TabsTrigger value="team-leader"><Crown className="mr-2 h-4 w-4" />Team Leader</TabsTrigger>
        </TabsList>
        
        {/* Sales Content */}
        <TabsContent value="sales" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Sales Manager View</CardTitle>
                    <CardDescription>Forecasting, pricing, and marketing budget management.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Tabs defaultValue={activeSectionTab || "market-analysis"} value={activeSectionTab || "market-analysis"} onValueChange={setActiveSectionTab} orientation="vertical">
                        <div className="grid md:grid-cols-4 gap-6">
                            <TabsList className="md:col-span-1 flex md:flex-col md:h-auto h-auto overflow-x-auto overflow-y-hidden w-full">
                                <TabsTrigger value="market-analysis" className="justify-start"><BarChart className="mr-2 h-4 w-4" />Market Analysis (ZMARKET)</TabsTrigger>
                                <TabsTrigger value="forecasting" className="justify-start"><FileSignature className="mr-2 h-4 w-4" />Forecasting (MD61)</TabsTrigger>
                                <TabsTrigger value="pricing" className="justify-start"><CircleDollarSign className="mr-2 h-4 w-4" />Pricing (VK32)</TabsTrigger>
                                <TabsTrigger value="marketing" className="justify-start"><Megaphone className="mr-2 h-4 w-4" />Marketing (ZADS)</TabsTrigger>
                            </TabsList>
                            <div className="md:col-span-3">
                                <TabsContent value="market-analysis">
                                    <Card>
                                        <CardHeader><CardTitle>Market Analysis & Competitor Check</CardTitle><CardDescription>Extract key market data from ZMARKET.</CardDescription></CardHeader>
                                        <CardContent><p className="text-sm text-muted-foreground">Content for this section to be built. Enter Competitor Avg. Price to drive pricing calculations.</p></CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="forecasting">
                                    <Card>
                                        <CardHeader><CardTitle>Forecasting Input</CardTitle><CardDescription>Calculate and set the total sales forecast for MD61.</CardDescription></CardHeader>
                                        <CardContent><p className="text-sm text-muted-foreground">Content for this section to be built. Final forecast will be pushed to the LIT.</p></CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="pricing">
                                    <Card>
                                        <CardHeader><CardTitle>Pricing Decision Matrix</CardTitle><CardDescription>Set the final price for all products for VK32.</CardDescription></CardHeader>
                                        <CardContent><p className="text-sm text-muted-foreground">Content for this section to be built. Set price strategy relative to competitor average.</p></CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="marketing">
                                    <Card>
                                        <CardHeader><CardTitle>Marketing Budget Allocation</CardTitle><CardDescription>Set the advertising spend for each distribution channel for ZADS.</CardDescription></CardHeader>
                                        <CardContent><p className="text-sm text-muted-foreground">Content for this section to be built. Input final ad spend for each DC.</p></CardContent>
                                    </Card>
                                </TabsContent>
                            </div>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </TabsContent>

        {/* Production Content */}
        <TabsContent value="production" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Production Manager View</CardTitle>
                    <CardDescription>Capacity, efficiency, BOM, and production release management.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue={activeSectionTab || "planning-capacity"} value={activeSectionTab || "planning-capacity"} onValueChange={setActiveSectionTab} orientation="vertical">
                         <div className="grid md:grid-cols-4 gap-6">
                            <TabsList className="md:col-span-1 flex md:flex-col md:h-auto h-auto overflow-x-auto overflow-y-hidden w-full">
                                <TabsTrigger value="planning-capacity" className="justify-start"><FileBox className="mr-2 h-4 w-4" />Planning & Capacity</TabsTrigger>
                                <TabsTrigger value="mrp" className="justify-start"><Wrench className="mr-2 h-4 w-4" />MRP (MD01)</TabsTrigger>
                                <TabsTrigger value="production-release" className="justify-start"><PackageCheck className="mr-2 h-4 w-4" />Production Release (CO41)</TabsTrigger>
                                <TabsTrigger value="bom-review" className="justify-start"><FileSignature className="mr-2 h-4 w-4" />BOM Review (ZCS02)</TabsTrigger>
                            </TabsList>
                             <div className="md:col-span-3">
                                <TabsContent value="planning-capacity">
                                    <Card>
                                        <CardHeader><CardTitle>Planning & Capacity Check</CardTitle><CardDescription>Confirm capacity and set lot size strategy.</CardDescription></CardHeader>
                                        <CardContent><p className="text-sm text-muted-foreground">Content for this section to be built. Pulls sales target from LIT and checks against capacity.</p></CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="mrp">
                                    <Card>
                                        <CardHeader><CardTitle>Materials Requirements Planning (MRP)</CardTitle><CardDescription>Execute the MRP run after the forecast is finalized.</CardDescription></CardHeader>
                                        <CardContent><p className="text-sm text-muted-foreground">Content for this section to be built. Includes a checklist to confirm MD01 execution.</p></CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="production-release">
                                    <Card>
                                        <CardHeader><CardTitle>Production Release Control</CardTitle><CardDescription>Final step to release production orders.</CardDescription></CardHeader>
                                        <CardContent><p className="text-sm text-muted-foreground">Content for this section to be built. Includes a checklist for CO41 and logs units to convert to LIT.</p></CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="bom-review">
                                    <Card>
                                        <CardHeader><CardTitle>Bill of Materials (BOM) Review</CardTitle><CardDescription>Track recipe changes for cost or sustainability.</CardDescription></CardHeader>
                                        <CardContent><p className="text-sm text-muted-foreground">Content for this section to be built. Set status for BOM changes (ZCS02).</p></CardContent>
                                    </Card>
                                </TabsContent>
                            </div>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </TabsContent>

        {/* Procurement Content */}
        <TabsContent value="procurement" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Procurement Manager View</CardTitle>
                    <CardDescription>RM sourcing, inventory replenishment, and sustainability investment.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue={activeSectionTab || "inventory-check"} value={activeSectionTab || "inventory-check"} onValueChange={setActiveSectionTab} orientation="vertical">
                         <div className="grid md:grid-cols-4 gap-6">
                            <TabsList className="md:col-span-1 flex md:flex-col md:h-auto h-auto overflow-x-auto overflow-y-hidden w-full">
                                <TabsTrigger value="inventory-check" className="justify-start"><Package className="mr-2 h-4 w-4" />Inventory Check (ZMB52)</TabsTrigger>
                                <TabsTrigger value="sourcing" className="justify-start"><Users className="mr-2 h-4 w-4" />Sourcing (ZME12)</TabsTrigger>
                                <TabsTrigger value="order-calculation" className="justify-start"><Truck className="mr-2 h-4 w-4" />Order Calc (ME59N)</TabsTrigger>
                                <TabsTrigger value="sustainability" className="justify-start"><Leaf className="mr-2 h-4 w-4" />Sustainability (ZFB50)</TabsTrigger>
                            </TabsList>
                             <div className="md:col-span-3">
                                <TabsContent value="inventory-check">
                                    <Card>
                                        <CardHeader><CardTitle>Inventory Check</CardTitle><CardDescription>Pulls current raw material stock and status from the LIT.</CardDescription></CardHeader>
                                        <CardContent><p className="text-sm text-muted-foreground">Content for this section to be built. This section will show low stock alerts.</p></CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="sourcing">
                                    <Card>
                                        <CardHeader><CardTitle>Sourcing Decision</CardTitle><CardDescription>Set the order strategy and vendor selection for each raw material.</CardDescription></CardHeader>
                                        <CardContent><p className="text-sm text-muted-foreground">Content for this section to be built. Choose between Fast or Green vendors.</p></CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="order-calculation">
                                    <Card>
                                        <CardHeader><CardTitle>Order Calculation</CardTitle><CardDescription>Calculate the required quantity to order based on MRP forecast and current stock.</CardDescription></CardHeader>
                                        <CardContent><p className="text-sm text-muted-foreground">Content for this section to be built. Pushes the final PO Qty to the LIT for execution in ME59N.</p></CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="sustainability">
                                    <Card>
                                        <CardHeader><CardTitle>Sustainability Investment</CardTitle><CardDescription>Track sustainability goals and investment amounts for ZFB50.</CardDescription></CardHeader>
                                        <CardContent><p className="text-sm text-muted-foreground">Content for this section to be built. Input the actual ZFB50 posting amount.</p></CardContent>
                                    </Card>
                                </TabsContent>
                            </div>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </TabsContent>

        {/* Logistics Content */}
        <TabsContent value="logistics" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Logistics Manager View</CardTitle>
                    <CardDescription>Finished goods transfer, cash flow monitoring, and contingency planning.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue={activeSectionTab || "liquidity-check"} value={activeSectionTab || "liquidity-check"} onValueChange={setActiveSectionTab} orientation="vertical">
                        <div className="grid md:grid-cols-4 gap-6">
                            <TabsList className="md:col-span-1 flex md:flex-col md:h-auto h-auto overflow-x-auto overflow-y-hidden w-full">
                                <TabsTrigger value="liquidity-check" className="justify-start"><Banknote className="mr-2 h-4 w-4" />Liquidity Check (ZFF7B)</TabsTrigger>
                                <TabsTrigger value="stock-transfer" className="justify-start"><PackageOpen className="mr-2 h-4 w-4" />Stock Transfer (ZMB1B)</TabsTrigger>
                                <TabsTrigger value="delivery-monitoring" className="justify-start"><Ship className="mr-2 h-4 w-4" />Delivery Monitoring (ZME2N)</TabsTrigger>
                            </TabsList>
                             <div className="md:col-span-3">
                                <TabsContent value="liquidity-check">
                                    <Card>
                                        <CardHeader><CardTitle>Liquidity & Cash Flow Check</CardTitle><CardDescription>Monitor current Cash Balance from ZFF7B.</CardDescription></CardHeader>
                                        <CardContent><p className="text-sm text-muted-foreground">Content for this section to be built. This section will trigger a red alert if cash is below €100,000.</p></CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="stock-transfer">
                                    <Card>
                                        <CardHeader><CardTitle>Stock Transfer Planning</CardTitle><CardDescription>Calculate and plan stock transfers to DCs using ZMB1B.</CardDescription></CardHeader>
                                        <CardContent><p className="text-sm text-muted-foreground">Content for this section to be built. Input target Days of Supply (DOS) to calculate transfer quantities.</p></CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="delivery-monitoring">
                                    <Card>
                                        <CardHeader><CardTitle>Delivery & PO Monitoring</CardTitle><CardDescription>Track incoming raw material deliveries from ZME2N.</CardDescription></CardHeader>
                                        <CardContent><p className="text-sm text-muted-foreground">Content for this section to be built. Flag late deliveries to Procurement.</p></CardContent>
                                    </Card>
                                </TabsContent>
                            </div>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </TabsContent>
        
        {/* Team Leader Content */}
        <TabsContent value="team-leader" className="mt-6">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Team Leader View</CardTitle>
                    <CardDescription>High-level strategy, data oversight, and final process governance.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Team Leader content to be built here.</p>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

