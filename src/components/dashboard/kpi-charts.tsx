
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
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts";
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

const formatPercent = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);


const chartConfigFinancial: ChartConfig = {
    cashBalance: {
      label: "Cash Balance",
      color: "hsl(var(--chart-2))",
    },
    netIncome: {
        label: "Net Income",
        color: "hsl(var(--chart-1))",
    },
}

const chartConfigMarket: ChartConfig = {
    marketShare: {
        label: "Market Share",
        color: "hsl(var(--chart-4))",
    },
    averageSellingPrice: {
        label: "Avg. Selling Price",
        color: "hsl(var(--chart-5))",
    },
}

const chartConfigOperational: ChartConfig = {
    inventoryTurnover: {
        label: "Inventory Turnover",
        color: "hsl(var(--chart-3))",
    },
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
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Financial Health</CardTitle>
          <CardDescription>Cash balance and net income over rounds.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfigFinancial} className="h-[250px] w-full">
            <LineChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="roundLabel" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis yAxisId="left" tickFormatter={formatCurrency} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={formatCurrency} />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line type="monotone" dataKey="cashBalance" yAxisId="left" stroke="var(--color-cashBalance)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="netIncome" yAxisId="right" stroke="var(--color-netIncome)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Market Performance</CardTitle>
          <CardDescription>Market share and average selling price.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfigMarket} className="h-[250px] w-full">
             <LineChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="roundLabel" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis yAxisId="left" tickFormatter={formatPercent} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={formatCurrency} />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="marketShare" yAxisId="left" stroke="var(--color-marketShare)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="averageSellingPrice" yAxisId="right" stroke="var(--color-averageSellingPrice)" strokeWidth={2} dot={false} />
             </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
       <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Operational & ESG</CardTitle>
          <CardDescription>Inventory turnover and CO₂ emissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfigOperational} className="h-[250px] w-full">
             <BarChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="roundLabel" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis yAxisId="left" tickFormatter={formatNumber} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={formatNumber} />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="inventoryTurnover" yAxisId="left" fill="var(--color-inventoryTurnover)" radius={4} />
                <Bar dataKey="totalEmissions" yAxisId="right" fill="var(--color-totalEmissions)" radius={4} />
             </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
