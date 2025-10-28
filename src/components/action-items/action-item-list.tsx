"use client";

import { useEffect, useState } from "react";
import {
  createActionItemAction,
  deleteActionItemAction,
  listActionItemsAction,
  updateActionItemAction,
} from "@/lib/firestore-actions";
import type { ActionItem, ActionItemPriority, ActionItemStatus } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useFirebase } from "@/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STATUS_OPTIONS: { value: ActionItemStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "backlog", label: "Backlog" },
  { value: "in_progress", label: "In Progress" },
  { value: "blocked", label: "Blocked" },
  { value: "done", label: "Completed" },
];

const PRIORITY_LABELS: Record<ActionItemPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const PRIORITY_STYLES: Record<ActionItemPriority, string> = {
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  high: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
};

type DraftActionItem = {
  title: string;
  description: string;
  priority: ActionItemPriority;
};

export function ActionItemList() {
  const { auth } = useFirebase();
  const { profile, user } = useAuth();
  const { toast } = useToast();

  const [items, setItems] = useState<ActionItem[]>([]);
  const [activeStatus, setActiveStatus] = useState<ActionItemStatus | "all">("in_progress");
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [draft, setDraft] = useState<DraftActionItem>({
    title: "",
    description: "",
    priority: "medium",
  });

  useEffect(() => {
    let isMounted = true;
    const loadItems = async () => {
      if (!auth?.currentUser || !profile) {
        return;
      }
      setIsLoading(true);
      try {
        const idToken = await auth.currentUser.getIdToken();
        const response = await listActionItemsAction({
          idToken,
          ownerProfileId: profile.id,
        });
        if (!isMounted) return;
        if (response.success) {
          setItems(response.data as ActionItem[]);
        } else {
          toast({
            title: "Unable to load action items",
            description: response.error,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          toast({
            title: "Unable to load action items",
            description: "We could not connect to Firestore.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadItems();

    return () => {
      isMounted = false;
    };
  }, [auth, profile, toast, user]);

  const getFilteredItems = (status: ActionItemStatus | "all") => {
    if (status === "all") return items;
    return items.filter((item) => item.status === status);
  };

  const handleCreate = async () => {
    if (!auth?.currentUser || !profile) return;
    if (!draft.title.trim()) {
      toast({
        title: "Add a title",
        description: "Action items need a concise title so your team knows what to do.",
        variant: "destructive",
      });
      return;
    }

    const optimisticItem: ActionItem = {
      id: `temp-${Date.now()}`,
      teamId: "temp",
      ownerUid: auth.currentUser.uid,
      ownerProfileId: profile.id,
      ownerRole: profile.name,
      title: draft.title.trim(),
      description: draft.description.trim(),
      status: "backlog",
      priority: draft.priority,
      dueRound: null,
      order: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setItems((prev) => [optimisticItem, ...prev]);
    setIsDialogOpen(false);
    setDraft({ title: "", description: "", priority: "medium" });

    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await createActionItemAction({
        idToken,
        title: optimisticItem.title,
        description: optimisticItem.description,
        ownerProfileId: profile.id,
        ownerRole: profile.name,
        priority: draft.priority,
      });
      if (response.success) {
        setItems((prev) =>
          [response.data as ActionItem, ...prev.filter((item) => item.id !== optimisticItem.id)]
        );
        toast({
          title: "Action item added",
          description: "Your new action item has been saved to the team workspace.",
        });
      } else {
        setItems((prev) => prev.filter((item) => item.id !== optimisticItem.id));
        toast({
          title: "Could not save action item",
          description: response.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      setItems((prev) => prev.filter((item) => item.id !== optimisticItem.id));
      toast({
        title: "Could not save action item",
        description: "We could not connect to Firestore.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (item: ActionItem, status: ActionItemStatus) => {
    if (!auth?.currentUser) return;
    const previous = items;
    const optimistic = items.map((existing) =>
      existing.id === item.id
        ? { ...existing, status, updatedAt: new Date().toISOString(), order: Date.now() }
        : existing
    );
    setItems(optimistic);

    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await updateActionItemAction({
        idToken,
        id: item.id,
        updates: { status, order: Date.now() },
      });
      if (response.success) {
        setItems((current) =>
          current.map((existing) =>
            existing.id === item.id ? (response.data as ActionItem) : existing
          )
        );
      } else {
        setItems(previous);
        toast({
          title: "Unable to update",
          description: response.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      setItems(previous);
      toast({
        title: "Unable to update",
        description: "Something went wrong while updating this item.",
        variant: "destructive",
      });
    }
  };

  const handlePriorityChange = async (item: ActionItem, priority: ActionItemPriority) => {
    if (!auth?.currentUser) return;
    const previous = items;
    const optimistic = items.map((existing) =>
      existing.id === item.id
        ? { ...existing, priority, updatedAt: new Date().toISOString() }
        : existing
    );
    setItems(optimistic);

    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await updateActionItemAction({
        idToken,
        id: item.id,
        updates: { priority },
      });
      if (response.success) {
        setItems((current) =>
          current.map((existing) =>
            existing.id === item.id ? (response.data as ActionItem) : existing
          )
        );
      } else {
        setItems(previous);
        toast({
          title: "Unable to update priority",
          description: response.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      setItems(previous);
      toast({
        title: "Unable to update priority",
        description: "Something went wrong while updating this item.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (item: ActionItem) => {
    if (!auth?.currentUser) return;
    const previous = items;
    setItems((current) => current.filter((existing) => existing.id !== item.id));

    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await deleteActionItemAction({ idToken, id: item.id });
      if (!response.success) {
        setItems(previous);
        toast({
          title: "Unable to delete",
          description: response.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      setItems(previous);
      toast({
        title: "Unable to delete",
        description: "We could not connect to Firestore.",
        variant: "destructive",
      });
    }
  };

  const handleToggleComplete = (item: ActionItem) => {
    const nextStatus: ActionItemStatus = item.status === "done" ? "in_progress" : "done";
    handleStatusChange(item, nextStatus);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="font-headline text-2xl">My Action Items</CardTitle>
          <CardDescription>
            Track personal follow-ups and commitments aligned to the current simulation round.
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!profile}>
              <Plus className="mr-2 h-4 w-4" /> New Action Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create action item</DialogTitle>
              <DialogDescription>
                Capture the next concrete step you need to take before the round ends.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="action-item-title">
                  Title
                </label>
                <Input
                  id="action-item-title"
                  placeholder="Align pricing guidance with sales team"
                  value={draft.title}
                  onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="action-item-description">
                  Details
                </label>
                <Textarea
                  id="action-item-description"
                  placeholder="Share the new VK32 price list in the team chat and confirm logistics impact."
                  value={draft.description}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, description: event.target.value }))
                  }
                  rows={4}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={draft.priority}
                  onValueChange={(value) =>
                    setDraft((prev) => ({ ...prev, priority: value as ActionItemPriority }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={!profile}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {!profile && (
          <p className="text-sm text-muted-foreground">
            Choose a role to start capturing your personal action items.
          </p>
        )}
        {profile && (
          <Tabs
            value={activeStatus}
            onValueChange={(value) => setActiveStatus(value as ActionItemStatus | "all")}
          >
            <TabsList className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((option) => (
                <TabsTrigger key={option.value} value={option.value} className="px-3 py-1">
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {STATUS_OPTIONS.map((option) => {
              const entries = getFilteredItems(option.value as ActionItemStatus | "all");
              return (
                <TabsContent key={option.value} value={option.value} className="mt-4 space-y-3">
                  {isLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading action items...
                    </div>
                  )}
                  {!isLoading && entries.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No action items in this list yet. Create one to keep your round organized.
                    </p>
                  )}
                  {!isLoading &&
                    entries.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col gap-3 rounded-lg border border-border/60 bg-background/50 p-4 shadow-sm md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex flex-1 items-start gap-3">
                          <Checkbox
                            checked={item.status === "done"}
                            onCheckedChange={() => handleToggleComplete(item)}
                            className="mt-1"
                            aria-label="Mark action item complete"
                          />
                          <div className="space-y-1">
                            <p className="font-medium leading-tight">{item.title}</p>
                            {item.description && (
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span>Role: {item.ownerRole}</span>
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
                        </div>
                        <div className="flex flex-col gap-2 md:items-end">
                          <div className="flex items-center gap-2">
                            <Select
                              value={item.status}
                              onValueChange={(value) =>
                                handleStatusChange(item, value as ActionItemStatus)
                              }
                            >
                              <SelectTrigger className="w-[160px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="backlog">Backlog</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="blocked">Blocked</SelectItem>
                                <SelectItem value="done">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select
                              value={item.priority}
                              onValueChange={(value) =>
                                handlePriorityChange(item, value as ActionItemPriority)
                              }
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High Priority</SelectItem>
                                <SelectItem value="medium">Medium Priority</SelectItem>
                                <SelectItem value="low">Low Priority</SelectItem>
                              </SelectContent>
                            </Select>
                            <Badge className={PRIORITY_STYLES[item.priority]}>
                              {PRIORITY_LABELS[item.priority]}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(item)}
                              aria-label="Delete action item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
