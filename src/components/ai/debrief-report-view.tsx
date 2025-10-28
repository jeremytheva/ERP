"use client";

import Markdown from "react-markdown";
import { format } from "date-fns";
import { useLatestReport } from "@/hooks/use-strategic-ai";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function DebriefReportView() {
  const { report, isLoading } = useLatestReport();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!report) {
    return (
      <p className="text-sm text-muted-foreground">
        Generate an AI debriefing to capture round summaries and action items.
      </p>
    );
  }

  const createdAt = report.createdAt
    ? format(report.createdAt, "PPpp")
    : "Pending sync";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold font-headline">
            Latest AI Debrief
          </h3>
          <p className="text-sm text-muted-foreground">Saved {createdAt}</p>
        </div>
        <Badge variant="secondary">Round {report.round}</Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ReportStat title="Performance Data" value={report.performanceData} />
        <ReportStat title="Competitor Analysis" value={report.competitorAnalysis} />
        <ReportStat title="Action Items" value={report.actionItems} />
      </div>

      <div className="space-y-2">
        <h4 className="text-base font-semibold font-headline">Summary</h4>
        <article className="prose prose-sm dark:prose-invert max-w-none bg-secondary/30 rounded-lg p-4">
          <Markdown>{report.summaryReport}</Markdown>
        </article>
      </div>
    </div>
  );
}

function ReportStat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <p className="text-sm mt-1 text-muted-foreground whitespace-pre-wrap">
        {value}
      </p>
    </div>
  );
}

