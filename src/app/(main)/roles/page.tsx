'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Briefcase,
  ShoppingCart,
  Factory,
  Truck,
  Crown,
} from 'lucide-react';
import { SalesManagerView } from '@/components/roles/sales-manager-view';
import { ProductionManagerView } from '@/components/roles/production-manager-view';
import { ProcurementManagerView } from '@/components/roles/procurement-manager-view';
import { LogisticsManagerView } from '@/components/roles/logistics-manager-view';

export default function RolesPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'sales';

  // State to manage active tabs to ensure URL params are reflected in the UI
  const [activeRoleTab, setActiveRoleTab] = useState(defaultTab);

  useEffect(() => {
    setActiveRoleTab(defaultTab);
  }, [defaultTab]);

  return (
    <div className="container mx-auto py-8">
      <Tabs
        defaultValue={activeRoleTab}
        value={activeRoleTab}
        onValueChange={setActiveRoleTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-5">
          <TabsTrigger value="sales">
            <Briefcase className="mr-2 h-4 w-4" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="production">
            <Factory className="mr-2 h-4 w-4" />
            Production
          </TabsTrigger>
          <TabsTrigger value="procurement">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Procurement
          </TabsTrigger>
          <TabsTrigger value="logistics">
            <Truck className="mr-2 h-4 w-4" />
            Logistics
          </TabsTrigger>
          <TabsTrigger value="team-leader">
            <Crown className="mr-2 h-4 w-4" />
            Team Leader
          </TabsTrigger>
        </TabsList>

        {/* Sales Content */}
        <TabsContent value="sales" className="mt-6">
          <SalesManagerView />
        </TabsContent>

        {/* Production Content */}
        <TabsContent value="production" className="mt-6">
          <ProductionManagerView />
        </TabsContent>

        {/* Procurement Content */}
        <TabsContent value="procurement" className="mt-6">
          <ProcurementManagerView />
        </TabsContent>

        {/* Logistics Content */}
        <TabsContent value="logistics" className="mt-6">
          <LogisticsManagerView />
        </TabsContent>

        {/* Team Leader Content */}
        <TabsContent value="team-leader" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-3xl">
                Team Leader View
              </CardTitle>
              <CardDescription>
                High-level strategy, data oversight, and final process
                governance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Team Leader content to be built here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
