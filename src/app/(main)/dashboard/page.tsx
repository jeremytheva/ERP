"use client";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { KpiCharts } from "@/components/dashboard/kpi-charts";
import { PeerComparisonChart } from "@/components/dashboard/peer-comparison-chart";
import { useGameState } from "@/hooks/use-game-data";
import { MOCK_PEER_DATA } from "@/lib/mock-data";
import { DollarSign, Factory, PiggyBank, Target } from "lucide-react";

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
      <PeerComparisonChart peerData={MOCK_PEER_DATA} currentUserValuation={gameState.companyValuation} />
    </div>
  );
}
