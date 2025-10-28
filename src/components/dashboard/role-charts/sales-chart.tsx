
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "../../ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, ComposedChart } from "recharts";
import type { KpiHistory, KpiHistoryEntry } from "../../../types";
import type { ChartConfig } from "../../ui/chart";
import { useMemo } from "react";

const chartConfig: ChartConfig = {
  marketShare: { label: "Market Share", color: "hsl(var(--chart-4))" },
  averageSellingPrice: { label: "Your Avg. Price", color: "hsl(var(--chart-1))" },
  competitorAvgPrice: { label: "Competitor Avg. Price", color: "hsl(var(--muted-foreground))" },
};

const formatCurrency = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
const formatPercent = (value: number) => new Intl.NumberFormat("en-US", { style: "percent", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

export function SalesChart({ history }: { history: KpiHistory }) {
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
        <CardTitle>Market Performance</CardTitle>
        <CardDescription>Market share and pricing over time.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ComposedChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="roundLabel" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis yAxisId="left" tickFormatter={formatPercent} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={formatCurrency} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="marketShare" yAxisId="left" fill="var(--color-marketShare)" radius={4} />
            <Line type="monotone" dataKey="averageSellingPrice" yAxisId="right" stroke="var(--color-averageSellingPrice)" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="competitorAvgPrice" yAxisId="right" stroke="var(--color-competitorAvgPrice)" strokeWidth={2} strokeDasharray="3 3" dot={false} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
