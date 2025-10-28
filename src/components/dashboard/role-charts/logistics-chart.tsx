
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "../../ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts";
import type { KpiHistory, KpiHistoryEntry } from "../../../types";
import type { ChartConfig } from "../../ui/chart";
import { useMemo } from "react";

const chartConfig: ChartConfig = {
  cashBalance: { label: "Cash Balance", color: "hsl(var(--chart-2))" },
  warehouseCosts: { label: "Warehouse Costs", color: "hsl(var(--chart-5))" },
};

const formatCurrency = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", compactDisplay: "short" }).format(value);

export function LogisticsChart({ history }: { history: KpiHistory }) {
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
        <CardTitle>Logistics Overview</CardTitle>
        <CardDescription>Key financial and cost metrics over time.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <LineChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="roundLabel" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis yAxisId="left" tickFormatter={formatCurrency} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={formatCurrency} />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line type="monotone" dataKey="cashBalance" yAxisId="left" stroke="var(--color-cashBalance)" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="warehouseCosts" yAxisId="right" stroke="var(--color-warehouseCosts)" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
