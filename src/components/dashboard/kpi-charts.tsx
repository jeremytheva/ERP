"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { KpiHistory } from "@/types";
import type { ChartConfig } from "@/components/ui/chart"

interface KpiChartsProps {
  history: KpiHistory;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    compactDisplay: "short",
  }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);

const chartConfigValuation: ChartConfig = {
    companyValuation: {
      label: "Company Valuation",
      color: "hsl(var(--chart-1))",
    },
  }

const chartConfigIncome: ChartConfig = {
    netIncome: {
        label: "Net Income",
        color: "hsl(var(--chart-2))",
    },
}

const chartConfigInventory: ChartConfig = {
    inventoryValue: {
        label: "Inventory Value",
        color: "hsl(var(--chart-3))",
    },
}

const chartConfigEmissions: ChartConfig = {
    totalEmissions: {
        label: "Total Emissions (t CO₂e)",
        color: "hsl(var(--chart-5))",
    },
}

export function KpiCharts({ history }: KpiChartsProps) {
  const chartData = history.map((item) => ({
    ...item,
    roundLabel: `R${item.round}`,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Valuation & Income Trends</CardTitle>
          <CardDescription>Company valuation and net income over rounds.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{...chartConfigValuation, ...chartConfigIncome}} className="h-[250px] w-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValuation" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-companyValuation)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-companyValuation)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-netIncome)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-netIncome)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="roundLabel" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis yAxisId="left" tickFormatter={formatCurrency} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={formatCurrency} />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area type="monotone" dataKey="companyValuation" yAxisId="left" stroke="var(--color-companyValuation)" fill="url(#colorValuation)" />
              <Area type="monotone" dataKey="netIncome" yAxisId="right" stroke="var(--color-netIncome)" fill="url(#colorIncome)" />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Operational & ESG Metrics</CardTitle>
          <CardDescription>Inventory value and CO₂ emissions over rounds.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{...chartConfigInventory, ...chartConfigEmissions}} className="h-[250px] w-full">
             <BarChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="roundLabel" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis yAxisId="left" tickFormatter={formatCurrency} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={formatNumber} />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="inventoryValue" yAxisId="left" fill="var(--color-inventoryValue)" radius={4} />
                <Bar dataKey="totalEmissions" yAxisId="right" fill="var(--color-totalEmissions)" radius={4} />
             </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
