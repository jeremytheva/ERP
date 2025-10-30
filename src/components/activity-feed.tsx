import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export interface ActivityFeedItem {
  id: string;
  title: string;
  summary?: string | null;
  timestamp: Date;
  category?: string;
  actionLabel?: string;
  actionHref?: string;
}

export interface ActivityFeedProps {
  title?: string;
  description?: string;
  items: ActivityFeedItem[];
  emptyState?: string;
  className?: string;
  maxHeight?: number;
}

export function ActivityFeed({
  title = "Recent Activity",
  description = "Latest actions, AI insights, and updates in this workspace.",
  items,
  emptyState = "No recent activity yet.",
  className,
  maxHeight = 320,
}: ActivityFeedProps) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description ? (
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea style={{ maxHeight }} className="pr-4">
          <ul className="space-y-4">
            {items.length === 0 ? (
              <li className="rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center text-sm text-muted-foreground">
                {emptyState}
              </li>
            ) : (
              items.map((item) => (
                <li key={item.id} className="rounded-lg border border-border/70 bg-background/60 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                        {item.category ? (
                          <Badge variant="outline" className="uppercase">
                            {item.category}
                          </Badge>
                        ) : null}
                      </div>
                      {item.summary ? (
                        <p className="text-sm text-muted-foreground">{item.summary}</p>
                      ) : null}
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                    {item.actionHref && item.actionLabel ? (
                      <Link
                        href={item.actionHref}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {item.actionLabel}
                      </Link>
                    ) : null}
                  </div>
                </li>
              ))
            )}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
