import * as React from "react";
import { Circle, Clock, type LucideIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ActivityIntent = "info" | "success" | "warning" | "danger";

export interface ActivityItem {
  id: string;
  title: string;
  body?: string;
  timestamp: Date;
  actor?: string;
  intent?: ActivityIntent;
  icon?: LucideIcon;
  meta?: string;
}

export interface ActivityFeedProps {
  title: string;
  description?: string;
  items: ActivityItem[];
  className?: string;
  maxItems?: number;
  emptyState?: React.ReactNode;
}

const intentStyles: Record<ActivityIntent, string> = {
  info: "text-sky-500",
  success: "text-emerald-500",
  warning: "text-amber-500",
  danger: "text-red-500",
};

function formatRelativeTime(date: Date) {
  const now = new Date();
  const diff = Math.max(0, now.getTime() - date.getTime());
  const minutes = Math.round(diff / (1000 * 60));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.round(days / 365);
  return `${years}y ago`;
}

export function ActivityFeed({
  title,
  description,
  items,
  className,
  maxItems = 8,
  emptyState,
}: ActivityFeedProps) {
  const content = items.slice(0, maxItems);

  return (
    <Card className={cn("border-border/60", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-0">
        {content.length === 0 && emptyState ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            {emptyState}
          </div>
        ) : (
          <ScrollArea className="h-[360px]">
            <ul className="grid gap-4 p-4">
              {content.map((item) => {
                const Icon = item.icon;
                const intent = item.intent ?? "info";
                const accentClass = intentStyles[intent];

                return (
                  <li
                    key={item.id}
                    className="rounded-lg border border-border/60 bg-background/80 p-4 shadow-sm transition hover:border-primary/50 hover:shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-muted", accentClass)}>
                        {Icon ? (
                          <Icon className="h-4 w-4" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold leading-tight">{item.title}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" aria-hidden />
                            <span>{formatRelativeTime(item.timestamp)}</span>
                          </div>
                        </div>
                        {item.actor && (
                          <Badge variant="secondary" className="text-xs font-medium">
                            {item.actor}
                          </Badge>
                        )}
                        {item.body && (
                          <p className="text-sm text-muted-foreground">{item.body}</p>
                        )}
                        {item.meta && (
                          <p className="text-xs uppercase tracking-wide text-muted-foreground/70">{item.meta}</p>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
