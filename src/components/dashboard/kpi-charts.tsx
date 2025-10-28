
"use client";

import { useMemo } from "react";

import type { KpiHistory, KpiHistoryEntry } from "@/types";
import { TrendChart } from "@/components/trend-chart";

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
      return [{ ...emptyRound, roundLabel: "R0" }, ...data];
    }
    return data;
  }, [history]);

  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
      <TrendChart
        className="lg:col-span-1"
        title="Financial Health"
        description="Cash balance and net income over rounds."
        data={chartData}
        index="roundLabel"
        series={[
          {
            dataKey: "cashBalance",
            name: "Cash Balance",
            type: "line",
            color: "hsl(var(--chart-2))",
            axis: "left",
          },
          {
            dataKey: "netIncome",
            name: "Net Income",
            type: "line",
            color: "hsl(var(--chart-1))",
            axis: "right",
          },
        ]}
        leftAxisFormatter={formatCurrency}
        rightAxisFormatter={formatCurrency}
        height={260}
      />
      <TrendChart
        className="lg:col-span-1"
        title="Market Performance"
        description="Market share and average price gap."
        data={chartData}
        index="roundLabel"
        series={[
          {
            dataKey: "marketShare",
            name: "Market Share",
            type: "line",
            color: "hsl(var(--chart-4))",
            axis: "left",
          },
          {
            dataKey: "averagePriceGap",
            name: "Avg. Price Gap",
            type: "line",
            color: "hsl(var(--chart-5))",
            axis: "right",
          },
        ]}
        leftAxisFormatter={formatPercent}
        rightAxisFormatter={formatCurrency}
        height={260}
      />
      <TrendChart
        className="lg:col-span-1"
        title="Operational & ESG"
        description="Turnover, warehouse costs, and CO₂ emissions."
        data={chartData}
        index="roundLabel"
        series={[
          {
            dataKey: "inventoryTurnover",
            name: "Inventory Turnover",
            type: "bar",
            color: "hsl(var(--chart-3))",
            axis: "left",
          },
          {
            dataKey: "warehouseCosts",
            name: "Warehouse Costs",
            type: "line",
            color: "hsl(var(--chart-1))",
            axis: "right",
          },
          {
            dataKey: "cumulativeCO2eEmissions",
            name: "CO₂e Emissions",
            type: "line",
            color: "hsl(var(--muted-foreground))",
            axis: "left",
            strokeDasharray: "3 3",
          },
        ]}
        leftAxisFormatter={formatNumber}
        rightAxisFormatter={formatCurrency}
        height={260}
      />
    </div>
  );
}
