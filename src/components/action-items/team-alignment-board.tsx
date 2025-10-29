"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listActionItemsAction,
  updateActionItemAction,
} from "@/lib/firestore-actions";
import type { ActionItem, ActionItemPriority, ActionItemStatus } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirebase } from "@/firebase";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw } from "lucide-react";

const STATUS_METADATA: Record<ActionItemStatus, { title: string; description: string }> = {
  backlog: {
    title: "Backlog",
    description: "Ideas and unassigned follow-ups that still need prioritization.",
  },
  in_progress: {
    title: "In Progress",
    description: "Items actively being worked on this round.",
  },
  blocked: {
    title: "Blocked",
    description: "Risks or dependencies preventing progress that need a team decision.",
  },
  done: {
    title: "Completed",
    description: "Finished deliverables ready for the debrief summary.",
  },
};

const PRIORITY_BADGES: Record<ActionItemPriority, string> = {
  high: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
};

type BoardColumn = ActionItemStatus;

type RoleFilter = "all" | string;

export function TeamAlignmentBoard() {
  const { auth } = useFirebase();
  const { toast } = useToast();
  const { user } = useAuth();

  const [items, setItems] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [activeColumn, setActiveColumn] = useState<ActionItemStatus | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  const loadItems = useCallback(async () => {
    if (!auth?.currentUser) return;
    setIsLoading(true);
    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await listActionItemsAction({ idToken });
      if (response.success) {
        setItems(response.data as ActionItem[]);
      } else {
        toast({
          title: "Unable to load team alignment data",
          description: response.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Unable to load team alignment data",
        description: "We could not connect to Firestore.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [auth, toast]);

  useEffect(() => {
    if (!auth?.currentUser) return;
    loadItems();
  }, [auth, loadItems, user?.uid]);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, itemId: string) => {
    setDraggedItemId(itemId);
    event.dataTransfer.setData("text/plain", itemId);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setActiveColumn(null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>, status: BoardColumn) => {
    event.preventDefault();
    setActiveColumn(status);
  };

  const handleDrop = async (
    event: React.DragEvent<HTMLDivElement>,
    status: BoardColumn
  ) => {
    event.preventDefault();
    const itemId = event.dataTransfer.getData("text/plain") || draggedItemId;
    setActiveColumn(null);
    setDraggedItemId(null);
    if (!itemId) return;

    const currentItem = items.find((item) => item.id === itemId);
    if (!currentItem || currentItem.status === status) {
      return;
    }

    const previousState = items;
    const optimistic = items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            status,
            order: Date.now(),
            updatedAt: new Date().toISOString(),
          }
        : item
    );
    setItems(optimistic);

    if (!auth?.currentUser) return;

    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await updateActionItemAction({
        idToken,
        id: itemId,
        updates: { status, order: Date.now() },
      });
      if (response.success) {
        setItems((existing) =>
          existing.map((item) =>
            item.id === itemId ? (response.data as ActionItem) : item
          )
        );
      } else {
        setItems(previousState);
        toast({
          title: "Unable to move card",
          description: response.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      setItems(previousState);
      toast({
        title: "Unable to move card",
        description: "We could not update Firestore.",
        variant: "destructive",
      });
    }
  };

  const filteredItems = useMemo(() => {
    if (roleFilter === "all") return items;
    return items.filter((item) => item.ownerRole === roleFilter);
  }, [items, roleFilter]);

  const roles = useMemo(() => {
    const unique = new Set<string>();
    items.forEach((item) => unique.add(item.ownerRole));
    return Array.from(unique.values());
  }, [items]);

  const getColumnItems = (status: BoardColumn) =>
    filteredItems
      .filter((item) => item.status === status)
      .sort((a, b) => b.order - a.order);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="font-headline text-2xl">Team Alignment Board</CardTitle>
          <CardDescription>
            Visualize cross-role action items and drag cards between lanes as progress changes.
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={loadItems}
            disabled={isLoading}
            aria-label="Refresh board"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Syncing the latest status updates...
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {(Object.keys(STATUS_METADATA) as BoardColumn[]).map((status) => {
              const columnItems = getColumnItems(status);
              const metadata = STATUS_METADATA[status];
              const isActive = activeColumn === status;

              return (
                <div
                  key={status}
                  onDragOver={(event) => handleDragOver(event, status)}
                  onDrop={(event) => handleDrop(event, status)}
                  onDragLeave={() => setActiveColumn(null)}
                  className={`flex min-h-[320px] flex-col gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 transition-colors ${
                    isActive ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{metadata.title}</h3>
                      <span className="text-xs text-muted-foreground">{columnItems.length}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{metadata.description}</p>
                  </div>
                  <div className="flex flex-1 flex-col gap-3">
                    {columnItems.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border/60 bg-background/50 p-4 text-center text-xs text-muted-foreground">
                        Nothing here yet. Drag an action item into this lane when plans change.
                      </div>
                    ) : (
                      columnItems.map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(event) => handleDragStart(event, item.id)}
                          onDragEnd={handleDragEnd}
                          className="cursor-grab rounded-lg border border-border/50 bg-background p-4 shadow-sm transition hover:border-primary"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <p className="font-medium leading-tight">{item.title}</p>
                              {item.description && (
                                <p className="text-xs text-muted-foreground line-clamp-3">{item.description}</p>
                              )}
                            </div>
                            <Badge className={PRIORITY_BADGES[item.priority]}>{item.priority}</Badge>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="rounded-md bg-muted px-2 py-1 text-[11px] uppercase tracking-wide">
                              {item.ownerRole}
                            </span>
                            <span>
                              Updated {new Date(item.updatedAt).toLocaleString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
