"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Markdown from "react-markdown";
import {
  collection,
  orderBy,
  query,
  where,
  type Query,
  type DocumentData,
} from "firebase/firestore";
import { FileText, Loader2, RefreshCcw, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { DEFAULT_GAME_ID } from "@/lib/logic/constants";
import type { DebriefReportDocument } from "@/lib/zod-schemas";
import { generateDebriefReportAction } from "@/lib/logic/server-actions";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useGameState } from "@/hooks/use-game-data";
import { useCompetitorLog } from "@/hooks/use-competitor-log";
import { useTasks } from "@/hooks/use-tasks";

const CREATED_EVENT = "debrief-report:created";

type DebriefReportViewProps = {
  gameId?: string;
};

function normalizeTimestamp(value: DebriefReportDocument["createdAt"]): Date | null {
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

export function DebriefReportView({ gameId = DEFAULT_GAME_ID }: DebriefReportViewProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const { gameState } = useGameState();
  const { logEntries } = useCompetitorLog();
  const { tasks } = useTasks();
  const [optimisticReports, setOptimisticReports] = useState<DebriefReportDocument[]>([]);
  const [isPending, startTransition] = useTransition();

  const reportsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const col = collection(firestore, "reports");
    return query(
      col,
      where("gameId", "==", gameId),
      orderBy("createdAt", "desc")
    ) as Query<DocumentData>;
  }, [firestore, gameId]);

  const { data, isLoading } = useCollection<DebriefReportDocument>(reportsQuery);

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<DebriefReportDocument>).detail;
      if (!detail || detail.gameId !== gameId) return;
      setOptimisticReports((prev) => [detail, ...prev.filter((item) => item.id !== detail.id)]);
    };

    document.addEventListener(CREATED_EVENT, listener);
    return () => document.removeEventListener(CREATED_EVENT, listener);
  }, [gameId]);

  useEffect(() => {
    if (!data || data.length === 0) return;
    setOptimisticReports((prev) => prev.filter((item) => !data.some((doc) => doc.id === item.id)));
  }, [data]);

  const combinedReports = useMemo(() => {
    const merged = new Map<string, DebriefReportDocument>();
    for (const item of optimisticReports) {
      merged.set(item.id, item);
    }
    for (const doc of data ?? []) {
      merged.set(doc.id, doc);
    }
    return Array.from(merged.values());
  }, [optimisticReports, data]);

  const handleGenerateReport = () => {
    const latestRound = gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round ?? 1;
    const performanceData = JSON.stringify({
      latestRound,
      latestKpi: gameState.kpiHistory[gameState.kpiHistory.length - 1] ?? null,
      summary: {
        companyValuation: gameState.companyValuation,
        netIncome: gameState.netIncome,
        marketShare: gameState.marketShare,
        grossMargin: gameState.grossMargin,
      },
    });
    const competitorAnalysis = JSON.stringify(logEntries.slice(0, 5));
    const actionItems = JSON.stringify(
      tasks
        .filter((task) => !task.completed)
        .slice(0, 10)
        .map((task) => ({
          id: task.id,
          title: task.title,
          role: task.role,
          priority: task.priority,
        }))
    );

    startTransition(() => {
      generateDebriefReportAction({
        gameId,
        authorId: user?.uid ?? profile?.id ?? "anonymous",
        performanceData,
        competitorAnalysis,
        actionItems,
        round: latestRound,
      })
        .then((result) => {
          setOptimisticReports((prev) => [result.optimisticReport, ...prev]);
          document.dispatchEvent(
            new CustomEvent(CREATED_EVENT, {
              detail: result.optimisticReport,
            })
          );
          toast({
            title: "Debrief Generated",
            description: "A fresh round report is available for the team.",
          });
        })
        .catch((error) => {
          console.error(error);
          toast({
            variant: "destructive",
            title: "Generation Failed",
            description: "We were unable to generate the debrief. Please try again.",
          });
        });
    });
  };

  if (isLoading && combinedReports.length === 0) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <FileText className="h-4 w-4" /> Round Debrief Reports
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Capture an AI summary of the latest round, including competitor moves and action items.
            </p>
          </div>
          <Button type="button" onClick={handleGenerateReport} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate Debrief
          </Button>
        </CardHeader>
      </Card>

      {combinedReports.length === 0 ? (
        <Card className="bg-secondary/40">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Run your first debrief to build a round-by-round archive of AI summaries and recommended next steps.
          </CardContent>
        </Card>
      ) : (
        combinedReports.map((report) => {
          const createdAt = normalizeTimestamp(report.createdAt);
          const isOptimistic = optimisticReports.some((item) => item.id === report.id);

          return (
            <Card key={report.id} className={isOptimistic ? "border-primary/70" : undefined}>
              <CardHeader>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">Round {report.round} Debrief</CardTitle>
                    {createdAt && (
                      <p className="text-xs text-muted-foreground">Generated {createdAt.toLocaleString()}</p>
                    )}
                  </div>
                  <Badge variant={isOptimistic ? "default" : "secondary"} className="w-fit">
                    {isOptimistic ? (
                      <span className="flex items-center gap-1">
                        <RefreshCcw className="h-3 w-3 animate-spin" /> Saving
                      </span>
                    ) : (
                      "Saved"
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <article className="prose prose-sm dark:prose-invert max-w-none">
                  <Markdown>{report.summaryReport}</Markdown>
                </article>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                    <h4 className="font-semibold uppercase tracking-wide text-muted-foreground">Performance Data</h4>
                    <pre className="mt-2 whitespace-pre-wrap break-words text-xs">{report.performanceData}</pre>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                    <h4 className="font-semibold uppercase tracking-wide text-muted-foreground">Competitor Analysis</h4>
                    <pre className="mt-2 whitespace-pre-wrap break-words text-xs">{report.competitorAnalysis}</pre>
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                  <h4 className="font-semibold uppercase tracking-wide text-muted-foreground">Action Items</h4>
                  <pre className="mt-2 whitespace-pre-wrap break-words text-xs">{report.actionItems}</pre>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
