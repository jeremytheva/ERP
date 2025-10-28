"use client";

import { format } from "date-fns";
import Markdown from "react-markdown";
import { useLatestStrategy } from "@/hooks/use-strategic-ai";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function AdvisorInsights() {
  const { strategy, isLoading } = useLatestStrategy();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!strategy) {
    return (
      <p className="text-sm text-muted-foreground">
        Run a scenario to generate AI-powered insights. Saved recommendations
        will appear here for your team.
      </p>
    );
  }

  const createdAt = strategy.createdAt
    ? format(strategy.createdAt, "PPpp")
    : "Pending sync";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold font-headline">
            Latest AI Strategy Snapshot
          </h3>
          <p className="text-sm text-muted-foreground">
            Saved {createdAt}
          </p>
        </div>
        <Badge variant="secondary">Round {strategy.scenario.round}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InsightMetric label="Marketing Spend" value={strategy.scenario.marketingSpend} type="currency" />
        <InsightMetric label="Production Volume" value={strategy.scenario.productionVolume} type="number" suffix=" units" />
        <InsightMetric label="Forecast Net Income" value={strategy.predictions.predictedNetIncome} type="currency" />
        <InsightMetric label="Forecast Emissions" value={strategy.predictions.predictedTotalEmissions} type="number" suffix=" t CO₂e" />
      </div>

      <div className="space-y-2">
        <h4 className="text-base font-semibold font-headline">Recommendations</h4>
        <article className="prose prose-sm dark:prose-invert max-w-none bg-secondary/30 rounded-lg p-4">
          <Markdown>{strategy.recommendations}</Markdown>
        </article>
      </div>
    </div>
  );
}

function InsightMetric({
  label,
  value,
  type,
  suffix,
}: {
  label: string;
  value: number;
  type: "currency" | "number";
  suffix?: string;
}) {
  const formatted =
    type === "currency"
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value)
      : new Intl.NumberFormat("en-US", {
          maximumFractionDigits: 0,
        }).format(value);

  return (
    <div className="rounded-lg border bg-background p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-lg font-semibold">
        {formatted}
        {suffix}
      </p>
    </div>
  );
}

