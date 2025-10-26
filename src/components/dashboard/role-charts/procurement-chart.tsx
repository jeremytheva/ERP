
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, ComposedChart } from "recharts";
import type { KpiHistory } from "@/types";
import type { ChartConfig } from "@/components/ui/chart";

const chartConfig: ChartConfig = {
  cogs: { label: "COGS", color: "hsl(var(--chart-1))" },
  warehouseCosts: { label: "Warehouse Costs", color: "hsl(var(--chart-5))" },
  cumulativeCO2eEmissions: { label: "CO₂e Emissions (kg)", color: "hsl(var(--muted-foreground))" },
};

const formatCurrency = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", compactDisplay: "short" }).format(value);
const formatNumber = (value: number) => new Intl.NumberFormat("en-US", { notation: "compact", compactDisplay: "short" }).format(value);

export function ProcurementChart({ history }: { history: KpiHistory }) {
  const chartData = history.map((item) => ({ ...item, roundLabel: `R${item.round}` }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Procurement Overview</CardTitle>
        <CardDescription>Costs and sustainability metrics over time.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ComposedChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="roundLabel" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis yAxisId="left" tickFormatter={formatCurrency} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={formatNumber} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="cogs" yAxisId="left" fill="var(--color-cogs)" radius={4} />
            <Line type="monotone" dataKey="warehouseCosts" yAxisId="left" stroke="var(--color-warehouseCosts)" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="cumulativeCO2eEmissions" yAxisId="right" stroke="var(--color-cumulativeCO2eEmissions)" strokeWidth={2} strokeDasharray="3 3" dot={false} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
