"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import type { CompanyMetric, TimeSeriesPoint } from "@/lib/firebase";
import { cn } from "@/lib/utils";

export interface TrendChartProps {
  title: string;
  description?: string;
  data: TimeSeriesPoint[];
  metric?: Pick<CompanyMetric, "unit">;
  className?: string;
  color?: string;
  yAxisLabel?: string;
}

const DEFAULT_COLOR = "hsl(var(--chart-1))";

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatValue(value: number, unit?: string) {
  if (unit === "%") {
    return `${value.toFixed(1)}%`;
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value);
}

export function TrendChart({
  title,
  description,
  data,
  metric,
  className,
  color = DEFAULT_COLOR,
  yAxisLabel,
}: TrendChartProps) {
  const normalizedData = data.map((point) => ({
    date: point.date,
    label: formatDateLabel(point.date),
    value: point.value,
  }));

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description ? (
          <CardDescription className="max-w-prose text-sm text-muted-foreground">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer
          config={{ metric: { label: title, color } }}
          className="h-[240px] w-full"
        >
          <AreaChart data={normalizedData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(value) => formatValue(value as number, metric?.unit ?? undefined)}
              label={
                yAxisLabel
                  ? { value: yAxisLabel, angle: -90, position: "insideLeft", offset: 12 }
                  : undefined
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(label) => String(label)}
                  formatter={(value: ValueType, name?: NameType) => {
                    const numericValue =
                      typeof value === "number" ? value : Number(value);
                    const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
                    const label = typeof name === "string" ? name : title;

                    return [
                      formatValue(safeValue, metric?.unit ?? undefined),
                      label,
                    ];
                  }}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill="url(#trendArea)"
              strokeWidth={2}
              name={metric?.unit ?? title}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
