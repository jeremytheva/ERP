import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  format?: "currency" | "number";
  unit?: string;
  className?: string;
}

const formatValue = (
  value: number,
  format: "currency" | "number" = "number"
) => {
  if (format === "currency") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      compactDisplay: "short",
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
};

export function KpiCard({
  title,
  value,
  icon: Icon,
  format,
  unit,
  className,
}: KpiCardProps) {
  return (
    <Card className={cn("shadow-sm hover:shadow-md transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatValue(value, format)}
          {unit && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
