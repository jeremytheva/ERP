"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { PlusCircle, Loader2, MoreVertical, Trash2 } from "lucide-react";
import { useActionItems } from "@/hooks/use-action-items";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  createActionItemAction,
  updateActionItemAction,
  deleteActionItemAction,
} from "@/lib/firestore-actions";

const ROLE_LABELS: Record<string, string> = {
  procurement: "Procurement",
  production: "Production",
  logistics: "Logistics",
  sales: "Sales",
  teamleader: "Team Leader",
  "team-leader": "Team Leader",
  team_leader: "Team Leader",
};

function resolveRoleLabel(role?: string | null) {
  if (!role) return undefined;
  return ROLE_LABELS[role] ?? role;
}

export function ActionItemList() {
  const { items, isLoading } = useActionItems();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [newItem, setNewItem] = useState("");
  const [isPending, startTransition] = useTransition();
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const hasItems = items.length > 0;

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aCompleted = a.completed ? 1 : 0;
      const bCompleted = b.completed ? 1 : 0;
      if (aCompleted !== bCompleted) {
        return aCompleted - bCompleted;
      }
      const aDate = "updatedAt" in a && a.updatedAt
        ? ("toDate" in a.updatedAt ? a.updatedAt.toDate() : new Date(a.updatedAt))
        : undefined;
      const bDate = "updatedAt" in b && b.updatedAt
        ? ("toDate" in b.updatedAt ? b.updatedAt.toDate() : new Date(b.updatedAt))
        : undefined;
      if (aDate && bDate) {
        return bDate.getTime() - aDate.getTime();
      }
      return 0;
    });
  }, [items]);

  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    if (!newItem.trim() || !user) {
      return;
    }

    startTransition(async () => {
      try {
        const idToken = await user.getIdToken();
        const result = await createActionItemAction({
          idToken,
          text: newItem.trim(),
          ownerRole: profile?.id,
          ownerName: profile?.name,
          isCustom: true,
        });

        if (!result.success) {
          toast({
            variant: "destructive",
            title: "Unable to add item",
            description: result.error,
          });
          return;
        }

        setNewItem("");
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Unable to add item",
          description: "We couldn't save your action item. Please try again.",
        });
      }
    });
  };

  const handleToggle = (itemId: string, completed: boolean) => {
    if (!user) return;

    setPendingIds((prev) => new Set(prev).add(itemId));
    startTransition(async () => {
      try {
        const idToken = await user.getIdToken();
        const result = await updateActionItemAction({
          idToken,
          itemId,
          updates: { completed },
        });

        if (!result.success) {
          toast({
            variant: "destructive",
            title: "Unable to update",
            description: result.error,
          });
        }
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Unable to update",
          description: "We couldn't update the action item.",
        });
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }
    });
  };

  const handleDelete = (itemId: string) => {
    if (!user) return;

    setPendingIds((prev) => new Set(prev).add(itemId));
    startTransition(async () => {
      try {
        const idToken = await user.getIdToken();
        const result = await deleteActionItemAction({ idToken, itemId });
        if (!result.success) {
          toast({
            variant: "destructive",
            title: "Unable to delete",
            description: result.error,
          });
        }
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Unable to delete",
          description: "We couldn't delete the action item.",
        });
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={newItem}
          onChange={(event) => setNewItem(event.target.value)}
          placeholder="Add an action item..."
          disabled={!user || isPending}
        />
        <Button type="submit" disabled={!newItem.trim() || !user || isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <PlusCircle className="h-4 w-4" />
          )}
          <span className="ml-2">Add</span>
        </Button>
      </form>

      <Separator />

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your action items...
        </div>
      ) : !hasItems ? (
        <p className="text-sm text-muted-foreground">
          You're all caught up! Add a new action item to get started.
        </p>
      ) : (
        <ul className="space-y-3">
          {sortedItems.map((item) => {
            const isProcessing = pendingIds.has(item.id);
            const updatedDate = item.updatedAt
              ? "toDate" in item.updatedAt
                ? item.updatedAt.toDate()
                : new Date(item.updatedAt)
              : undefined;

            return (
              <li
                key={item.id}
                className="flex items-start gap-3 rounded-md border bg-background px-3 py-2 shadow-sm"
              >
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={(checked) =>
                    handleToggle(item.id, Boolean(checked))
                  }
                  disabled={isProcessing}
                />
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={`text-sm font-medium ${
                        item.completed ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {item.text}
                    </p>
                    {resolveRoleLabel(item.ownerRole) && (
                      <Badge variant="secondary">{resolveRoleLabel(item.ownerRole)}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {updatedDate
                      ? `Updated ${formatDistanceToNow(updatedDate, {
                          addSuffix: true,
                        })}`
                      : "Awaiting sync"}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleDelete(item.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
