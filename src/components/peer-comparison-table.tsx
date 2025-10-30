import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export type PeerTrendDirection = "up" | "down" | "flat";

export interface PeerComparisonRow {
  id: string;
  label: string;
  value: number;
  change?: number | null;
  direction?: PeerTrendDirection;
}

export interface PeerComparisonTableProps {
  title?: string;
  description?: string;
  rows: PeerComparisonRow[];
  highlightRowId?: string;
  valueFormatter?: (value: number) => string;
  changeFormatter?: (value: number) => string;
  className?: string;
}

const DEFAULT_VALUE_FORMATTER = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    compactDisplay: "short",
  }).format(value);

const DEFAULT_CHANGE_FORMATTER = (value: number) =>
  `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;

const DIRECTION_ICON: Record<PeerTrendDirection, typeof ArrowUpRight> = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: Minus,
};

const DIRECTION_CLASSNAMES: Record<PeerTrendDirection, string> = {
  up: "text-emerald-600",
  down: "text-red-600",
  flat: "text-muted-foreground",
};

export function PeerComparisonTable({
  title = "Peer Comparison",
  description = "How your KPIs compare against peer companies.",
  rows,
  highlightRowId,
  valueFormatter = DEFAULT_VALUE_FORMATTER,
  changeFormatter = DEFAULT_CHANGE_FORMATTER,
  className,
}: PeerComparisonTableProps) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description ? (
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-2/5">Company</TableHead>
              <TableHead className="w-1/5 text-right">Value</TableHead>
              <TableHead className="w-1/5 text-right">Change</TableHead>
              <TableHead className="w-1/5 text-right">Direction</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const direction: PeerTrendDirection = row.direction ?? "flat";
              const Icon = DIRECTION_ICON[direction];
              const change = row.change ?? 0;
              const isHighlighted = row.id === highlightRowId;

              return (
                <TableRow
                  key={row.id}
                  className={cn({
                    "bg-primary/5 font-medium": isHighlighted,
                  })}
                >
                  <TableCell className="font-medium text-foreground">
                    {row.label}
                    {isHighlighted ? (
                      <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        You
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {valueFormatter(row.value)}
                  </TableCell>
                  <TableCell className={cn("text-right", DIRECTION_CLASSNAMES[direction])}>
                    {changeFormatter(change)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn("inline-flex items-center justify-end gap-1", DIRECTION_CLASSNAMES[direction])}>
                      <Icon className="h-4 w-4" />
                      <span className="text-xs uppercase">{direction}</span>
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
