"use client";

import { useEffect, useMemo, useState } from "react";
import Markdown from "react-markdown";
import { Brain, CalendarClock, NotebookPen } from "lucide-react";
import {
  collection,
  orderBy,
  query,
  where,
  type Query,
  type DocumentData,
} from "firebase/firestore";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { DEFAULT_GAME_ID } from "@/lib/logic/constants";
import type { StrategyDocument } from "@/lib/zod-schemas";

const CREATED_EVENT = "sales-scenario:created";

type AdvisorInsightsProps = {
  gameId?: string;
};

function normalizeTimestamp(value: StrategyDocument["createdAt"]): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === "object" && value !== null && "seconds" in value) {
    return new Date((value.seconds as number) * 1000);
  }
  return null;
}

export function AdvisorInsights({ gameId = DEFAULT_GAME_ID }: AdvisorInsightsProps) {
  const firestore = useFirestore();
  const [optimisticStrategies, setOptimisticStrategies] = useState<StrategyDocument[]>([]);

  const strategiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const col = collection(firestore, "strategies");
    return query(
      col,
      where("gameId", "==", gameId),
      orderBy("createdAt", "desc")
    ) as Query<DocumentData>;
  }, [firestore, gameId]);

  const { data, isLoading } = useCollection<StrategyDocument>(strategiesQuery);

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<StrategyDocument>).detail;
      if (!detail || detail.gameId !== gameId) return;
      setOptimisticStrategies((prev) => [detail, ...prev.filter((item) => item.id !== detail.id)]);
    };

    document.addEventListener(CREATED_EVENT, listener);
    return () => document.removeEventListener(CREATED_EVENT, listener);
  }, [gameId]);

  useEffect(() => {
    if (!data || data.length === 0) return;
    setOptimisticStrategies((prev) => prev.filter((item) => !data.some((doc) => doc.id === item.id)));
  }, [data]);

  const combinedStrategies = useMemo(() => {
    const merged = new Map<string, StrategyDocument>();
    for (const item of optimisticStrategies) {
      merged.set(item.id, item);
    }
    for (const doc of data ?? []) {
      merged.set(doc.id, doc);
    }
    return Array.from(merged.values());
  }, [optimisticStrategies, data]);

  if (isLoading && combinedStrategies.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!isLoading && combinedStrategies.length === 0) {
    return (
      <Card className="bg-secondary/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Brain className="h-4 w-4" /> Advisor Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Run a sales scenario to capture AI-backed recommendations. Saved insights will appear here for the whole team.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {combinedStrategies.map((strategy) => {
        const createdAt = normalizeTimestamp(strategy.createdAt);
        const updatedAt = normalizeTimestamp(strategy.updatedAt);
        const isOptimistic = optimisticStrategies.some((item) => item.id === strategy.id);

        return (
          <Card key={strategy.id} className={isOptimistic ? "border-primary/70" : undefined}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    {strategy.scenario.name}
                  </CardTitle>
                  {strategy.scenario.description && (
                    <p className="text-sm text-muted-foreground">{strategy.scenario.description}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={isOptimistic ? "default" : "secondary"} className="uppercase tracking-wide">
                    {isOptimistic ? "Saving" : "Saved"}
                  </Badge>
                  {createdAt && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {createdAt.toLocaleString()}
                    </div>
                  )}
                  {updatedAt && (
                    <span className="text-[11px] text-muted-foreground">Updated {updatedAt.toLocaleTimeString()}</span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border bg-muted/40 p-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Scenario Inputs</h4>
                  <dl className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt>Marketing Spend</dt>
                      <dd>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(strategy.scenario.marketingSpend)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Production Volume</dt>
                      <dd>{new Intl.NumberFormat("en-US").format(strategy.scenario.productionVolume)} units</dd>
                    </div>
                  </dl>
                </div>
                <div className="rounded-lg border bg-muted/40 p-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Predicted Impact</h4>
                  <dl className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt>Company Valuation</dt>
                      <dd>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(strategy.predictions.predictedCompanyValuation)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Net Income</dt>
                      <dd>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(strategy.predictions.predictedNetIncome)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Inventory Value</dt>
                      <dd>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(strategy.predictions.predictedInventoryValue)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Total Emissions</dt>
                      <dd>{new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(strategy.predictions.predictedTotalEmissions)} t CO₂e</dd>
                    </div>
                  </dl>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  <NotebookPen className="h-4 w-4" /> Advisor Recommendations
                </h4>
                <article className="prose prose-sm dark:prose-invert max-w-none">
                  <Markdown>{strategy.recommendations}</Markdown>
                </article>
              </div>
              {strategy.notes && strategy.notes.trim().length > 0 && (
                <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                  <p className="font-semibold text-muted-foreground">Team Notes</p>
                  <p className="mt-1 whitespace-pre-line">{strategy.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
