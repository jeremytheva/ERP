import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { MetricDeltaDirection, MetricStatus } from "../../docs/firestore-schema";

export type KpiValueFormat = "currency" | "number" | "percent";

export interface KpiCardProps {
  title: string;
  value: number;
  icon?: LucideIcon;
  format?: KpiValueFormat;
  unit?: string;
  deltaValue?: number | null;
  deltaDirection?: MetricDeltaDirection;
  deltaPeriodLabel?: string | null;
  status?: MetricStatus;
  tooltip?: string;
  trendSparkline?: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
}

const STATUS_COPY: Record<MetricStatus, string> = {
  "on-track": "On Track",
  "watch": "Watch",
  "at-risk": "At Risk",
};

const STATUS_VARIANTS: Record<MetricStatus, "default" | "secondary" | "destructive"> = {
  "on-track": "secondary",
  watch: "default",
  "at-risk": "destructive",
};

function formatValue(value: number, format: KpiValueFormat = "number") {
  if (Number.isNaN(value)) {
    return "-";
  }

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
        maximumFractionDigits: 1,
        minimumFractionDigits: 0,
      }).format(value);
    default:
      return new Intl.NumberFormat("en-US", {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1,
      }).format(value);
  }
}

function DeltaIndicator({
  value,
  direction,
  periodLabel,
  format,
}: {
  value?: number | null;
  direction?: MetricDeltaDirection;
  periodLabel?: string | null;
  format: KpiValueFormat;
}) {
  if (value == null || direction == null) {
    return null;
  }

  const Icon =
    direction === "increase"
      ? ArrowUpRight
      : direction === "decrease"
      ? ArrowDownRight
      : Minus;

  const formattedValue = formatValue(value, format);
  const deltaCopy = periodLabel ? `${formattedValue} ${periodLabel}` : formattedValue;

  const deltaClassName = cn("text-sm font-medium", {
    "text-emerald-600": direction === "increase",
    "text-red-600": direction === "decrease",
    "text-muted-foreground": direction === "neutral",
  });

  return (
    <div className={deltaClassName}>
      <span className="inline-flex items-center gap-1">
        <Icon className="h-4 w-4" />
        {deltaCopy}
      </span>
    </div>
  );
}

function renderCardContent(props: KpiCardProps) {
  const {
    title,
    value,
    icon: Icon,
    format = "number",
    unit,
    deltaValue,
    deltaDirection,
    deltaPeriodLabel,
    status,
    trendSparkline,
    footer,
    className,
    contentClassName,
  } = props;

  return (
    <Card className={cn("shadow-sm transition-shadow hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
        <div className="space-y-1">
          <CardDescription className="text-xs font-medium uppercase tracking-wide">
            {title}
          </CardDescription>
          <CardTitle className="text-3xl font-semibold">
            {formatValue(value, format)}
            {unit ? <span className="ml-2 text-base font-medium text-muted-foreground">{unit}</span> : null}
          </CardTitle>
        </div>
        {Icon ? (
          <span className="rounded-full border bg-muted/40 p-2 text-muted-foreground">
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </CardHeader>
      <CardContent className={cn("flex flex-col gap-3 pt-0", contentClassName)}>
        <div className="flex items-center justify-between">
          <DeltaIndicator
            value={deltaValue}
            direction={deltaDirection}
            periodLabel={deltaPeriodLabel ?? undefined}
            format={format === "percent" ? "percent" : format}
          />
          {status ? (
            <Badge variant={STATUS_VARIANTS[status]} className="uppercase">
              {STATUS_COPY[status]}
            </Badge>
          ) : null}
        </div>
        {trendSparkline ? (
          <div className="h-[80px] w-full">{trendSparkline}</div>
        ) : null}
      </CardContent>
      {footer ? <CardFooter className="pt-0 text-sm text-muted-foreground">{footer}</CardFooter> : null}
    </Card>
  );
}

export function KpiCard(props: KpiCardProps) {
  const content = renderCardContent(props);

  if (!props.tooltip) {
    return content;
  }

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="top" align="center">
          <p className="max-w-xs text-sm leading-relaxed">{props.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
