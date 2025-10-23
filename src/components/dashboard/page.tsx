
"use client";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { KpiCharts } from "@/components/dashboard/kpi-charts";
import { useGameState } from "@/hooks/use-game-data";
import { DollarSign, Factory, PiggyBank, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "lucide-react";


export default function DashboardPage() {
  const { gameState } = useGameState();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Company Valuation"
          value={gameState.companyValuation}
          icon={Target}
          format="currency"
        />
        <KpiCard
          title="Net Income"
          value={gameState.netIncome}
          icon={DollarSign}
          format="currency"
        />
        <KpiCard
          title="Inventory Value"
          value={gameState.inventoryValue}
          icon={PiggyBank}
          format="currency"
        />
        <KpiCard
          title="Total Emissions"
          value={gameState.totalEmissions}
          icon={Factory}
          format="number"
          unit="t CO₂e"
        />
      </div>
      <KpiCharts history={gameState.kpiHistory} />
      <Card>
        <CardHeader>
          <CardTitle>Peer Comparison: Company Valuation</CardTitle>
          <CardDescription>
            This feature is not yet available. Competitor data is not currently being stored in the database.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
          <BarChart className="h-12 w-12 mb-4" />
          <p>No peer comparison data available.</p>
        </CardContent>
      </Card>
    </div>
  );
}
