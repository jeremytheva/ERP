
"use client";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { KpiCharts } from "@/components/dashboard/kpi-charts";
import { useGameState } from "@/hooks/use-game-data";
import { DollarSign, Factory, HandCoins, Package, TrendingUp, Ship, Percent, Target, Leaf } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StrategicAdvisor } from "@/components/ai/strategic-advisor";
import { Lightbulb } from "lucide-react";
import { useTeamSettings, TEAM_LEADER_ROLE_ID } from "@/hooks/use-team-settings";
import { TaskBoard } from "@/components/dashboard/task-board";


export default function DashboardPage() {
  const { gameState } = useGameState();
  const { isRoleVisible } = useTeamSettings();
  const showStrategicAdvisor = isRoleVisible(TEAM_LEADER_ROLE_ID);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          title="Company Valuation"
          value={gameState.companyValuation}
          icon={Target}
          format="currency"
          tooltip="The total estimated value of your company."
        />
        <KpiCard
          title="Net Income"
          value={gameState.netIncome}
          icon={DollarSign}
          format="currency"
          tooltip="Your company's total profit after all expenses."
        />
         <KpiCard
          title="Cash Balance"
          value={gameState.cashBalance}
          icon={HandCoins}
          format="currency"
          tooltip="The total amount of cash your company has on hand."
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
          title="CO₂e Emissions"
          value={gameState.cumulativeCO2eEmissions}
          icon={Leaf}
          format="number"
          unit="kg"
          tooltip="Cumulative CO₂ equivalent emissions from operations."
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <KpiCharts history={gameState.kpiHistory} />
        </div>
        <div className="lg:col-span-1">
          {showStrategicAdvisor && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Lightbulb className="h-6 w-6" />
                  <div>
                    <CardTitle>AI Strategic Advisor</CardTitle>
                    <CardDescription>
                      AI-powered recommendations based on your current state.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <StrategicAdvisor />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <TaskBoard />
    </div>
  );
}


