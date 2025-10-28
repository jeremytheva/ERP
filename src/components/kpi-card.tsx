import * as React from "react";
import { type LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type KpiValueFormat = "currency" | "number" | "percent" | "compact";

type TrendDirection = "up" | "down" | "flat";

export interface KpiCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: LucideIcon;
  format?: KpiValueFormat;
  unit?: string;
  change?: number;
  changeLabel?: string;
  trend?: TrendDirection;
  tooltip?: string;
  footer?: React.ReactNode;
  className?: string;
  accent?: "default" | "success" | "warning" | "danger";
}

const numberFormatters: Record<KpiValueFormat, Intl.NumberFormat> = {
  currency: new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    compactDisplay: "short",
  }),
  number: new Intl.NumberFormat("en-US", {
    notation: "standard",
    maximumFractionDigits: 0,
  }),
  percent: new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }),
  compact: new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  }),
};

const trendClassMap: Record<Exclude<TrendDirection, "flat">, string> = {
  up: "text-emerald-600 dark:text-emerald-400",
  down: "text-red-600 dark:text-red-400",
};

const accentBorderMap: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  default: "border-border/60",
  success: "border-emerald-500/40",
  warning: "border-amber-500/40",
  danger: "border-red-500/40",
};

function formatValue(value: number | string, format: KpiValueFormat, unit?: string) {
  if (typeof value === "string") {
    return value;
  }

  const formatter = numberFormatters[format];
  const formatted = formatter.format(value);
  return unit ? `${formatted}${unit}` : formatted;
}

function getTrendLabel(change?: number, trend?: TrendDirection) {
  if (change === undefined || change === null) {
    return null;
  }

  if (trend === "flat" || change === 0) {
    return (
      <span className="text-xs text-muted-foreground">No change</span>
    );
  }

  const direction: Exclude<TrendDirection, "flat"> =
    trend && trend !== "flat" ? trend : change > 0 ? "up" : "down";
  const prefix = direction === "up" ? "+" : "";
  const trendColor = trendClassMap[direction];

  return (
    <span className={cn("text-xs font-medium", trendColor)}>
      {`${prefix}${change.toFixed(1)}%`}
    </span>
  );
}

export function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  format = "compact",
  unit,
  change,
  changeLabel,
  trend,
  tooltip,
  footer,
  className,
  accent = "default",
}: KpiCardProps) {
  const content = (
    <Card
      className={cn(
        "group relative overflow-hidden border bg-background shadow-sm transition-shadow hover:shadow-md",
        accentBorderMap[accent],
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-sm font-semibold text-muted-foreground">{title}</CardTitle>
          {description && <p className="text-xs text-muted-foreground/80">{description}</p>}
        </div>
        {Icon && (
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold tracking-tight">
            {formatValue(value, format, unit)}
          </span>
          {getTrendLabel(change, trend)}
        </div>
        {(changeLabel || footer) && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {changeLabel && <span>{changeLabel}</span>}
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!tooltip) {
    return content;
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent className="max-w-xs text-sm text-muted-foreground">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
