import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type PeerTrend = "up" | "down" | "flat";

export interface PeerComparisonRow {
  id: string;
  name: string;
  metric: number;
  delta?: number;
  trend?: PeerTrend;
  isLeader?: boolean;
  notes?: string;
}

export interface PeerComparisonTableProps {
  title: string;
  description?: string;
  rows: PeerComparisonRow[];
  metricLabel?: string;
  deltaLabel?: string;
  formatMetric?: (value: number) => string;
  formatDelta?: (value: number) => string;
  className?: string;
}

const defaultFormatMetric = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    compactDisplay: "short",
  }).format(value);

const defaultFormatDelta = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;

const trendIconMap: Record<Exclude<PeerTrend, "flat">, React.ReactNode> = {
  up: <ArrowUpRight className="h-4 w-4 text-emerald-500" aria-hidden />, 
  down: <ArrowDownRight className="h-4 w-4 text-red-500" aria-hidden />, 
};

export function PeerComparisonTable({
  title,
  description,
  rows,
  metricLabel = "Value",
  deltaLabel = "Δ",
  formatMetric = defaultFormatMetric,
  formatDelta = defaultFormatDelta,
  className,
}: PeerComparisonTableProps) {
  return (
    <Card className={cn("border-border/60", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Peer</TableHead>
                <TableHead className="text-right">{metricLabel}</TableHead>
                <TableHead className="text-right">{deltaLabel}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const { id, trend = "flat" } = row;
                const deltaContent: React.ReactNode =
                  row.delta === undefined ? "—" : formatDelta(row.delta);

                return (
                  <TableRow key={id} data-state={row.isLeader ? "selected" : undefined}>
                    <TableCell className="flex items-center gap-2 font-medium">
                      <span>{row.name}</span>
                      {row.isLeader && <Badge variant="secondary">Leader</Badge>}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatMetric(row.metric)}
                    </TableCell>
                    <TableCell className="flex items-center justify-end gap-2 text-sm">
                      {trend === "flat" ? (
                        <Minus className="h-4 w-4 text-muted-foreground" aria-hidden />
                      ) : (
                        trendIconMap[trend]
                      )}
                      <span className={cn(
                        "font-medium",
                        trend === "up" && "text-emerald-600",
                        trend === "down" && "text-red-600",
                        trend === "flat" && "text-muted-foreground",
                      )}>
                        {deltaContent}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
