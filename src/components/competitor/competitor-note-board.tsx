"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { Flag, Lightbulb, Target, Loader2, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCompetitorNotes } from "@/hooks/use-competitor-notes";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  createCompetitorNoteAction,
  updateCompetitorNoteAction,
  deleteCompetitorNoteAction,
} from "@/lib/firestore-actions";
import type { CompetitorNote } from "@/types";
import { useUserProfiles } from "@/hooks/use-user-profiles";

const NOTE_COLUMNS = [
  {
    id: "intel" as const,
    title: "Competitive Intel",
    description: "Incoming observations about competitors.",
    icon: Flag,
  },
  {
    id: "analysis" as const,
    title: "Analysis",
    description: "Team insights and hypotheses.",
    icon: Lightbulb,
  },
  {
    id: "response" as const,
    title: "Response Plan",
    description: "Actions we're taking in response.",
    icon: Target,
  },
];

type ColumnId = (typeof NOTE_COLUMNS)[number]["id"];

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
  if (!role) return "All Roles";
  return ROLE_LABELS[role] ?? role;
}

export function CompetitorNoteBoard() {
  const { notes } = useCompetitorNotes();
  const { user, profile } = useAuth();
  const { profiles } = useUserProfiles();
  const { toast } = useToast();
  const [filterRole, setFilterRole] = useState<string>("all");
  const [activeColumn, setActiveColumn] = useState<ColumnId | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [noteDraft, setNoteDraft] = useState({
    title: "",
    summary: "",
    role: profile?.id ?? "",
  });

  const availableRoles = useMemo(() => {
    const allRoles = new Set<string>();
    profiles.forEach((roleProfile) => allRoles.add(roleProfile.id));
    notes.forEach((note) => {
      if (note.role) allRoles.add(note.role);
    });
    return Array.from(allRoles).sort((a, b) =>
      resolveRoleLabel(a).localeCompare(resolveRoleLabel(b))
    );
  }, [notes, profiles]);

  const filteredNotes = useMemo(() => {
    if (filterRole === "all") return notes;
    if (filterRole === "my-role" && profile?.id) {
      return notes.filter((note) => note.role === profile.id);
    }
    return notes.filter((note) => note.role === filterRole);
  }, [notes, filterRole, profile?.id]);

  const notesByColumn = useMemo(() => {
    return NOTE_COLUMNS.reduce(
      (acc, column) => {
        acc[column.id] = filteredNotes.filter((note) => note.status === column.id);
        return acc;
      },
      NOTE_COLUMNS.reduce(
        (initial, column) => ({ ...initial, [column.id]: [] as CompetitorNote[] }),
        {} as Record<ColumnId, CompetitorNote[]>
      )
    );
  }, [filteredNotes]);

  const handleCreateNote = (event: FormEvent) => {
    event.preventDefault();
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to add competitor notes.",
      });
      return;
    }

    if (!noteDraft.title.trim() || !noteDraft.summary.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "A title and summary are both required.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const idToken = await user.getIdToken();
        const result = await createCompetitorNoteAction({
          idToken,
          title: noteDraft.title.trim(),
          summary: noteDraft.summary.trim(),
          status: "intel",
          role: noteDraft.role || undefined,
          createdByName: profile?.name,
        });

        if (!result.success) {
          toast({
            variant: "destructive",
            title: "Unable to create note",
            description: result.error,
          });
          return;
        }

        setNoteDraft({ title: "", summary: "", role: profile?.id ?? "" });
        setIsDialogOpen(false);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Unable to create note",
          description: "We couldn't save your note. Please try again.",
        });
      }
    });
  };

  const handleDrop = (noteId: string, columnId: ColumnId) => {
    if (!user) return;

    startTransition(async () => {
      try {
        const idToken = await user.getIdToken();
        const result = await updateCompetitorNoteAction({
          idToken,
          noteId,
          updates: {
            status: columnId,
            order: Date.now(),
          },
        });

        if (!result.success) {
          toast({
            variant: "destructive",
            title: "Unable to move note",
            description: result.error,
          });
        }
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Unable to move note",
          description: "We couldn't update the note. Please try again.",
        });
      } finally {
        setDraggedId(null);
        setActiveColumn(null);
      }
    });
  };

  const handleDelete = (noteId: string) => {
    if (!user) return;

    startTransition(async () => {
      try {
        const idToken = await user.getIdToken();
        const result = await deleteCompetitorNoteAction({ idToken, noteId });
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
          description: "We couldn't delete the note. Please try again.",
        });
      }
    });
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle>Competitor Notes Board</CardTitle>
          <CardDescription>
            Drag and drop notes across stages to keep the team aligned on competitor activity.
          </CardDescription>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="my-role">My role</SelectItem>
              {availableRoles.map((roleId) => (
                <SelectItem key={roleId} value={roleId}>
                  {resolveRoleLabel(roleId)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add competitor insight</DialogTitle>
                <DialogDescription>
                  Summarize what you observed and how it impacts our strategy.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateNote} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={noteDraft.title}
                    onChange={(event) => setNoteDraft((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Competitor launched a new product"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Summary</label>
                  <Textarea
                    value={noteDraft.summary}
                    onChange={(event) => setNoteDraft((prev) => ({ ...prev, summary: event.target.value }))}
                    placeholder="Outline the key details and any signals this gives us."
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Focus role</label>
                  <Select
                    value={noteDraft.role}
                    onValueChange={(value) => setNoteDraft((prev) => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All roles</SelectItem>
                      {availableRoles.map((roleId) => (
                        <SelectItem key={roleId} value={roleId}>
                          {resolveRoleLabel(roleId)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save note
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-3">
          {NOTE_COLUMNS.map((column) => {
            const ColumnIcon = column.icon;
            const columnNotes = notesByColumn[column.id];
            const isActive = activeColumn === column.id;

            return (
              <div
                key={column.id}
                className={`flex min-h-[320px] flex-col rounded-lg border bg-muted/10 p-4 transition-colors ${
                  isActive ? "border-primary bg-primary/5" : ""
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setActiveColumn(column.id);
                }}
                onDragLeave={() => {
                  setActiveColumn((current) => (current === column.id ? null : current));
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (draggedId) {
                    handleDrop(draggedId, column.id);
                  }
                  setActiveColumn(null);
                  setDraggedId(null);
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <ColumnIcon className="h-4 w-4 text-primary" />
                      {column.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{column.description}</p>
                  </div>
                  <Badge variant="secondary">{columnNotes.length}</Badge>
                </div>
                <ScrollArea className="mt-4 h-full">
                  <div className="space-y-3 pr-2">
                    {columnNotes.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Drop notes here to move them into this stage.
                      </p>
                    ) : (
                      columnNotes.map((note) => {
                        const updatedAt = note.updatedAt
                          ? "toDate" in note.updatedAt
                            ? note.updatedAt.toDate()
                            : new Date(note.updatedAt)
                          : null;

                        return (
                          <div
                            key={note.id}
                            className="group rounded-md border bg-background p-3 shadow-sm"
                            draggable
                            onDragStart={() => setDraggedId(note.id)}
                            onDragEnd={() => {
                              setDraggedId(null);
                              setActiveColumn(null);
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1">
                                <p className="text-sm font-medium">{note.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {resolveRoleLabel(note.role)}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                                onClick={() => handleDelete(note.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">{note.summary}</p>
                            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                {note.createdByName ? `Added by ${note.createdByName}` : "Shared note"}
                              </span>
                              <span>
                                {updatedAt
                                  ? formatDistanceToNow(updatedAt, { addSuffix: true })
                                  : "Just now"}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
