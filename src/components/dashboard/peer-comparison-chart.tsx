
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
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList, Cell } from "recharts";
import type { MetricFormat, PeerMetricPoint } from "@/types";
import { useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";

interface PeerComparisonChartProps {
  data: PeerMetricPoint[];
  metricLabel: string;
  title?: string;
  description?: string;
  format?: MetricFormat;
  highlightName?: string;
}

const formatters: Record<MetricFormat, (value: number) => string> = {
  currency: (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      compactDisplay: "short",
    }).format(value),
  percent: (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value),
  number: (value: number) =>
    new Intl.NumberFormat("en-US", {
      notation: "compact",
      compactDisplay: "short",
    }).format(value),
};

const formatMetricValue = (value: number, format: MetricFormat = "number") =>
  formatters[format](value);

export function PeerComparisonChart({
  data,
  metricLabel,
  title = "Peer Comparison",
  description = "Your performance against other teams.",
  format = "number",
  highlightName,
}: PeerComparisonChartProps) {
  const { profile } = useAuth();
  const resolvedHighlight = highlightName || profile?.name || "You";

  const chartData = useMemo(() => {
    if (!data?.length) return [];
    return [...data].sort((a, b) => b.value - a.value);
  }, [data]);

  if (!chartData.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="pl-0">
        <ChartContainer config={{}} className="h-[250px] w-full">
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 40 }}>
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              width={100}
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
            />
            <XAxis dataKey="value" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value) => `${metricLabel}: ${formatMetricValue(value as number, format)}`}
                />
              }
            />
            <Bar dataKey="value" radius={4}>
              {chartData.map((entry) => (
                <Cell
                  key={`peer-${entry.name}`}
                  fill={entry.name === resolvedHighlight ? "hsl(var(--accent))" : "hsl(var(--chart-2))"}
                />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
                formatter={(value: number) => formatMetricValue(value, format)}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
