
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "../ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, ComposedChart } from "recharts";
import type { KpiHistory, KpiHistoryEntry } from "../../types";
import type { ChartConfig } from "../ui/chart";
import { useMemo } from "react";

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
    averagePriceGap: {
        label: "Avg. Price Gap",
        color: "hsl(var(--chart-5))",
    },
}

const chartConfigOperational: ChartConfig = {
    inventoryTurnover: {
        label: "Inventory Turnover",
        color: "hsl(var(--chart-3))",
    },
    cumulativeCO2eEmissions: {
        label: "CO₂e Emissions (kg)",
        color: "hsl(var(--muted-foreground))",
    },
    warehouseCosts: {
        label: "Warehouse Costs",
        color: "hsl(var(--chart-1))",
    }
}

export function KpiCharts({ history }: KpiChartsProps) {
  const chartData = useMemo(() => {
    const data = history.map((item) => ({
      ...item,
      roundLabel: `R${item.round}`,
    }));

    if (data.length === 1) {
      const emptyRound: KpiHistoryEntry = {
        round: 0,
        companyValuation: 0,
        netIncome: 0,
        inventoryValue: 0,
        cashBalance: 0,
        grossMargin: 0,
        marketShare: 0,
        averageSellingPrice: 0,
        inventoryTurnover: 0,
        capacityUtilization: 0,
        averagePriceGap: 0,
        warehouseCosts: 0,
        onTimeDeliveryRate: 0,
        cumulativeCO2eEmissions: 0,
        competitorAvgPrice: 0,
        grossRevenue: 0,
        cogs: 0,
        sustainabilityInvestment: 0,
      };
      return [{...emptyRound, roundLabel: "R0"}, ...data];
    }
    return data;
  }, [history]);

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
          <CardDescription>Market share and average price gap.</CardDescription>
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
                <Line type="monotone" dataKey="averagePriceGap" yAxisId="right" stroke="var(--color-averagePriceGap)" strokeWidth={2} dot={false} />
             </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
       <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Operational & ESG</CardTitle>
          <CardDescription>Turnover, warehouse costs, and CO₂ emissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfigOperational} className="h-[250px] w-full">
             <ComposedChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="roundLabel" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis yAxisId="left" tickFormatter={formatNumber} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={formatCurrency} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="inventoryTurnover" yAxisId="left" fill="var(--color-inventoryTurnover)" radius={4} />
                <Line type="monotone" dataKey="warehouseCosts" yAxisId="right" stroke="var(--color-warehouseCosts)" strokeWidth={2} dot={{r: 4}} />
                <Line type="monotone" dataKey="cumulativeCO2eEmissions" yAxisId="left" stroke="var(--color-cumulativeCO2eEmissions)" strokeWidth={2} strokeDasharray="3 3" dot={false} />
             </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
