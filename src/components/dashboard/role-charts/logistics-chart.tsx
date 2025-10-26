
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts";
import type { KpiHistory } from "@/types";
import type { ChartConfig } from "@/components/ui/chart";

const chartConfig: ChartConfig = {
  cashBalance: { label: "Cash Balance", color: "hsl(var(--chart-2))" },
  warehouseCosts: { label: "Warehouse Costs", color: "hsl(var(--chart-5))" },
};

const formatCurrency = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", compactDisplay: "short" }).format(value);

export function LogisticsChart({ history }: { history: KpiHistory }) {
  const chartData = history.map((item) => ({ ...item, roundLabel: `R${item.round}` }));

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
