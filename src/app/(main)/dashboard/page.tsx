
"use client";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { KpiCharts } from "@/components/dashboard/kpi-charts";
import { useGameState } from "@/hooks/use-game-data";
import { DollarSign, Factory, PiggyBank, Target, BarChart, LineChart, TrendingUp, HandCoins, Percent, Package, Truck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PeerComparisonChart } from "@/components/dashboard/peer-comparison-chart";

// Mock peer data - in a real app, this would come from your database
const mockPeerData = [
  { name: 'Team Alpha', companyValuation: 52000000, netIncome: 2800000, totalEmissions: 1150 },
  { name: 'Team Bravo', companyValuation: 48000000, netIncome: 2300000, totalEmissions: 1300 },
  { name: 'Team Charlie', companyValuation: 55000000, netIncome: 3100000, totalEmissions: 1050 },
];


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

      <PeerComparisonChart 
        peerData={mockPeerData}
        currentUserValuation={gameState.companyValuation}
      />
    </div>
  );
}
