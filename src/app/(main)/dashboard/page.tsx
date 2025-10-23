
"use client";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { KpiCharts } from "@/components/dashboard/kpi-charts";
import { useGameState } from "@/hooks/use-game-data";
import { DollarSign, Factory, HandCoins, Percent, Package, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { gameState } = useGameState();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          title="Cash Balance"
          value={gameState.cashBalance}
          icon={HandCoins}
          format="currency"
          tooltip="The total amount of cash your company has on hand."
        />
        <KpiCard
          title="Net Income"
          value={gameState.netIncome}
          icon={DollarSign}
          format="currency"
          tooltip="Your company's total profit after all expenses."
        />
        <KpiCard
          title="Gross Margin"
          value={gameState.grossMargin}
          icon={Percent}
          format="percent"
          tooltip="The profitability of your products, (Revenue - COGS) / Revenue."
        />
        <KpiCard
          title="Market Share"
          value={gameState.marketShare}
          icon={TrendingUp}
          format="percent"
          tooltip="Your company's sales as a percentage of total market sales."
        />
        <KpiCard
          title="Inventory Turnover"
          value={gameState.inventoryTurnover}
          icon={Package}
          format="number"
           unit="x"
          tooltip="How many times inventory is sold and replaced over a period."
        />
        <KpiCard
          title="Capacity Utilization"
          value={gameState.capacityUtilization}
          icon={Factory}
          format="percent"
          tooltip="The extent to which production capacity is being used."
        />
      </div>
      
      <KpiCharts history={gameState.kpiHistory} />
    </div>
  );
}
