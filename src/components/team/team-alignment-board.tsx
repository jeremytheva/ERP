"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { Users, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTeamAlignmentSnapshotAction } from "@/lib/firestore-actions";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "@/components/ui/separator";

type AlignmentSummary = {
  roleId: string;
  roleName: string;
  completed: number;
  total: number;
  pendingTitles: string[];
  lastUpdated: string | null;
};

const ROLE_DISPLAY_ORDER = ["teamleader", "sales", "procurement", "production", "logistics"];

export function TeamAlignmentBoard() {
  const { user } = useAuth();
  const [summaries, setSummaries] = useState<AlignmentSummary[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchAlignment = useCallback(() => {
    if (!user) return;

    startTransition(async () => {
      try {
        const idToken = await user.getIdToken();
        const result = await getTeamAlignmentSnapshotAction({ idToken });
        if (!result.success) {
          setError(result.error);
          return;
        }

        setError(null);
        setSummaries(result.data.summaries);
        setLastUpdated(result.data.updatedAt);
      } catch (error) {
        console.error(error);
        setError("Unable to load team alignment.");
      }
    });
  }, [user]);

  useEffect(() => {
    if (!user) {
      setSummaries([]);
      return;
    }
    fetchAlignment();
  }, [user, fetchAlignment]);

  const orderedSummaries = useMemo(() => {
    return [...summaries].sort((a, b) => {
      const aIndex = ROLE_DISPLAY_ORDER.indexOf(a.roleId);
      const bIndex = ROLE_DISPLAY_ORDER.indexOf(b.roleId);
      if (aIndex !== -1 || bIndex !== -1) {
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      }
      return a.roleName.localeCompare(b.roleName);
    });
  }, [summaries]);

  const renderSummary = (summary: AlignmentSummary) => {
    const progress = summary.total === 0 ? 0 : Math.round((summary.completed / summary.total) * 100);
    const lastUpdatedDate = summary.lastUpdated ? new Date(summary.lastUpdated) : null;

    return (
      <Card key={summary.roleId} className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{summary.roleName}</Badge>
              <span className="text-xs text-muted-foreground">
                {summary.completed}/{summary.total} complete
              </span>
            </div>
            {lastUpdatedDate && (
              <span className="text-xs text-muted-foreground">
                Updated {formatDistanceToNow(lastUpdatedDate, { addSuffix: true })}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={progress} />
          {summary.pendingTitles.length > 0 ? (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Top blockers
              </p>
              <ul className="space-y-1 text-sm">
                {summary.pendingTitles.map((title, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{title}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No outstanding items.</p>
          )}
        </CardContent>
      </Card>
    );
  };

  const lastUpdatedDisplay = lastUpdated
    ? `Synced ${formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}`
    : "Awaiting first sync";

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Team Alignment Board</CardTitle>
              <CardDescription>{lastUpdatedDisplay}</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAlignment} disabled={isPending || !user}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-4 py-6">
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {!error && orderedSummaries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Alignment data will appear once your teammates add action items.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {orderedSummaries.map((summary) => renderSummary(summary))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
