
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts";
import type { KpiHistory } from "@/types";
import type { ChartConfig } from "@/components/ui/chart";

const chartConfig: ChartConfig = {
  capacityUtilization: { label: "Capacity Utilization", color: "hsl(var(--chart-3))" },
  inventoryTurnover: { label: "Inventory Turnover", color: "hsl(var(--chart-4))" },
};

const formatPercent = (value: number) => new Intl.NumberFormat("en-US", { style: "percent", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
const formatNumber = (value: number) => new Intl.NumberFormat("en-US", { notation: "compact", compactDisplay: "short" }).format(value);

export function ProductionChart({ history }: { history: KpiHistory }) {
  const chartData = history.map((item) => ({ ...item, roundLabel: `R${item.round}` }));

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
