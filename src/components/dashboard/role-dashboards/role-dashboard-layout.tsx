"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PeerComparisonChart } from "@/components/dashboard/peer-comparison-chart";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { RoleDashboardData, RoleDashboardTrend } from "./types";
import type { ChartConfig } from "@/components/ui/chart";
import type { MetricFormat } from "@/types";

interface RoleDashboardLayoutProps {
  title: string;
  subtitle?: string;
  data?: RoleDashboardData | null;
  isLoading?: boolean;
  errorMessage?: string;
}

const formatValue = (value: number, format: MetricFormat = "number") => {
  switch (format) {
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        compactDisplay: "short",
      }).format(value);
    case "percent":
      return new Intl.NumberFormat("en-US", {
        style: "percent",
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }).format(value);
    default:
      return new Intl.NumberFormat("en-US", {
        notation: "compact",
        compactDisplay: "short",
      }).format(value);
  }
};

const TrendChart = ({ trend }: { trend: RoleDashboardTrend }) => {
  const chartConfig = useMemo(() => {
    return trend.series.reduce<ChartConfig>((acc, series, index) => {
      acc[series.id] = {
        label: series.label,
        color: series.color || `hsl(var(--chart-${(index % 5) + 1}))`,
      };
      return acc;
    }, {} as ChartConfig);
  }, [trend.series]);

  const chartData = useMemo(() => {
    const rounds = new Set<number>();
    trend.series.forEach((series) => {
      series.data.forEach((point) => {
        rounds.add(point.round);
      });
    });

    const sortedRounds = Array.from(rounds).sort((a, b) => a - b);

    return sortedRounds.map((round) => {
      const entry: Record<string, number | string> = {
        round,
        roundLabel: `R${round}`,
      };
      trend.series.forEach((series) => {
        const value = series.data.find((point) => point.round === round)?.value ?? null;
        if (value !== null) {
          entry[series.id] = value;
        }
      });
      return entry;
    });
  }, [trend.series]);

  const primaryFormat = trend.series[0]?.format ?? "number";

  if (!chartData.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{trend.title}</CardTitle>
        {trend.description ? <CardDescription>{trend.description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <LineChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="roundLabel" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickFormatter={(value: number) => formatValue(value, primaryFormat)} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [formatValue(value as number, primaryFormat), chartConfig[name]?.label ?? name]}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            {trend.series.map((series) => (
              <Line
                key={series.id}
                type="monotone"
                dataKey={series.id}
                stroke={`var(--color-${series.id})`}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

const DashboardTable = ({
  title,
  description,
  columns,
  rows,
  caption,
}: NonNullable<RoleDashboardData["table"]>) => {
  if (!rows.length) return null;

  return (
    <Card>
      <CardHeader>
        {title ? <CardTitle>{title}</CardTitle> : null}
        {description ? <CardDescription>{description}</CardDescription> : null}
        {caption ? <p className="text-xs text-muted-foreground">{caption}</p> : null}
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.key} className="whitespace-nowrap">
                    {typeof row[column.key] === "number"
                      ? `${formatValue(row[column.key] as number, column.format ?? "number")}${column.unit ? ` ${column.unit}` : ""}`
                      : (row[column.key] ?? "–")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export function RoleDashboardLayout({
  title,
  subtitle,
  data,
  isLoading,
  errorMessage,
}: RoleDashboardLayoutProps) {
  const kpis = data?.kpis ?? [];

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
        {data?.updatedAtLabel ? (
          <p className="text-xs text-muted-foreground">Last updated {data.updatedAtLabel}</p>
        ) : null}
      </div>

      {errorMessage ? (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">Unable to load metrics</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={`kpi-skeleton-${index}`} className="h-32 w-full rounded-xl" />
            ))
          : kpis.map((kpi) => (
              <KpiCard
                key={kpi.id}
                title={kpi.label}
                value={kpi.value}
                icon={kpi.icon}
                format={kpi.format}
                unit={kpi.unit}
                tooltip={kpi.tooltip}
              />
            ))}
      </div>

      {data?.trend ? <TrendChart trend={data.trend} /> : null}

      {data?.peerComparison ? (
        <PeerComparisonChart
          data={data.peerComparison.data}
          metricLabel={data.peerComparison.metricLabel}
          title={data.peerComparison.title}
          description={data.peerComparison.description}
          format={data.peerComparison.format}
          highlightName={data.peerComparison.highlightName}
        />
      ) : null}

      {data?.table ? (
        <DashboardTable
          title={data.table.title}
          description={data.table.description}
          caption={data.table.caption}
          columns={data.table.columns}
          rows={data.table.rows}
        />
      ) : null}
    </section>
  );
}
