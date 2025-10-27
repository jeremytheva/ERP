
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts";
import type { KpiHistory, KpiHistoryEntry } from "@/types";
import type { ChartConfig } from "@/components/ui/chart";
import { useMemo } from "react";

const chartConfig: ChartConfig = {
  capacityUtilization: { label: "Capacity Utilization", color: "hsl(var(--chart-3))" },
  inventoryTurnover: { label: "Inventory Turnover", color: "hsl(var(--chart-4))" },
};

const formatPercent = (value: number) => new Intl.NumberFormat("en-US", { style: "percent", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
const formatNumber = (value: number) => new Intl.NumberFormat("en-US", { notation: "compact", compactDisplay: "short" }).format(value);

export function ProductionChart({ history }: { history: KpiHistory }) {
  const chartData = useMemo(() => {
    const data = history.map((item) => ({ ...item, roundLabel: `R${item.round}` }));
     if (data.length === 1) {
       const emptyRound: KpiHistoryEntry = {
        round: 0, companyValuation: 0, netIncome: 0, inventoryValue: 0, cumulativeCO2eEmissions: 0, cashBalance: 0, grossMargin: 0, marketShare: 0, averageSellingPrice: 0, inventoryTurnover: 0, capacityUtilization: 0, averagePriceGap: 0, warehouseCosts: 0, onTimeDeliveryRate: 0, competitorAvgPrice: 0, grossRevenue: 0, cogs: 0, sustainabilityInvestment: 0,
      };
      return [{...emptyRound, roundLabel: "R0"}, ...data];
    }
    return data;
  }, [history]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Production Efficiency</CardTitle>
        <CardDescription>Capacity and inventory metrics over time.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="roundLabel" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis yAxisId="left" tickFormatter={formatPercent} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={formatNumber} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="capacityUtilization" yAxisId="left" fill="var(--color-capacityUtilization)" radius={4} />
            <Bar dataKey="inventoryTurnover" yAxisId="right" fill="var(--color-inventoryTurnover)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
