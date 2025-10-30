import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ComposedChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

export type TrendSeriesType = "line" | "area" | "bar";

export interface TrendSeries {
  dataKey: string;
  name: string;
  type?: TrendSeriesType;
  color?: string;
  axis?: "left" | "right";
  strokeDasharray?: string;
  fillOpacity?: number;
}

export interface TrendChartProps {
  title: string;
  description?: string;
  data: Record<string, string | number>[];
  index: string;
  series: TrendSeries[];
  className?: string;
  height?: number;
  leftAxisFormatter?: (value: number) => string;
  rightAxisFormatter?: (value: number) => string;
}

const defaultFormatter = (value: number) => value.toLocaleString();

export function TrendChart({
  title,
  description,
  data,
  index,
  series,
  className,
  height = 300,
  leftAxisFormatter = defaultFormatter,
  rightAxisFormatter = defaultFormatter,
}: TrendChartProps) {
  const chartConfig = React.useMemo<ChartConfig>(() => {
    return series.reduce((config, current) => {
      config[current.dataKey] = {
        label: current.name,
        color: current.color ?? "hsl(var(--chart-1))",
      };
      return config;
    }, {} as ChartConfig);
  }, [series]);

  const containerStyle = React.useMemo(
    () => ({ "--chart-height": `${height}px` }) as React.CSSProperties,
    [height],
  );

  const hasRightAxis = React.useMemo(
    () => series.some((entry) => entry.axis === "right"),
    [series],
  );

  const ChartElement = React.useMemo(() => {
    const hasMixedTypes = new Set(series.map((item) => item.type ?? "line")).size > 1;

    if (hasMixedTypes) {
      return (
        <ComposedChart data={data}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey={index} tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis
            yAxisId="left"
            tickFormatter={leftAxisFormatter}
            stroke="hsl(var(--muted-foreground))"
          />
          {hasRightAxis && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={rightAxisFormatter}
              stroke="hsl(var(--muted-foreground))"
            />
          )}
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          {series.map((item) => {
            const color = item.color ?? `var(--color-${item.dataKey})`;
            switch (item.type) {
              case "area":
                return (
                  <Area
                    key={item.dataKey}
                    type="monotone"
                    dataKey={item.dataKey}
                    stroke={color}
                    fill={color}
                    fillOpacity={item.fillOpacity ?? 0.15}
                    yAxisId={item.axis ?? "left"}
                    strokeWidth={2}
                    dot={false}
                  />
                );
              case "bar":
                return (
                  <Bar
                    key={item.dataKey}
                    dataKey={item.dataKey}
                    fill={color}
                    radius={4}
                    yAxisId={item.axis ?? "left"}
                  />
                );
              default:
                return (
                  <Line
                    key={item.dataKey}
                    type="monotone"
                    dataKey={item.dataKey}
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray={item.strokeDasharray}
                    yAxisId={item.axis ?? "left"}
                  />
                );
            }
          })}
        </ComposedChart>
      );
    }

    const type = series[0]?.type ?? "line";
    const color = series[0]?.color ?? `var(--color-${series[0]?.dataKey})`;

    if (type === "bar") {
      return (
        <BarChart data={data}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey={index} tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickFormatter={leftAxisFormatter} stroke="hsl(var(--muted-foreground))" />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey={series[0].dataKey} fill={color} radius={4} />
        </BarChart>
      );
    }

    if (type === "area") {
      return (
        <AreaChart data={data}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey={index} tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickFormatter={leftAxisFormatter} stroke="hsl(var(--muted-foreground))" />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          {series.map((item) => {
            const seriesColor = item.color ?? `var(--color-${item.dataKey})`;
            return (
              <Area
                key={item.dataKey}
                type="monotone"
                dataKey={item.dataKey}
                stroke={seriesColor}
                fill={seriesColor}
                fillOpacity={item.fillOpacity ?? 0.15}
                strokeWidth={2}
                dot={false}
              />
            );
          })}
        </AreaChart>
      );
    }

    return (
      <LineChart data={data}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey={index} tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickFormatter={leftAxisFormatter} stroke="hsl(var(--muted-foreground))" />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <ChartLegend content={<ChartLegendContent />} />
        {series.map((item) => {
          const seriesColor = item.color ?? `var(--color-${item.dataKey})`;
          return (
            <Line
              key={item.dataKey}
              type="monotone"
              dataKey={item.dataKey}
              stroke={seriesColor}
              strokeWidth={2}
              dot={false}
              strokeDasharray={item.strokeDasharray}
            />
          );
        })}
      </LineChart>
    );
  }, [data, index, leftAxisFormatter, rightAxisFormatter, series, hasRightAxis]);

  return (
    <Card className={cn("border-border/60", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[var(--chart-height)] w-full"
          style={containerStyle}
        >
          <ResponsiveContainer width="100%" height="100%">
            {ChartElement}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
