"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createCompetitorNoteAction,
  deleteCompetitorNoteAction,
  listCompetitorNotesAction,
  updateCompetitorNoteAction,
} from "@/lib/firestore-actions";
import type {
  CompetitorNote,
  CompetitorNotePriority,
  CompetitorNoteStatus,
  Role,
} from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirebase } from "@/firebase";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";

const STATUSES: CompetitorNoteStatus[] = ["observation", "insight", "response", "watch"];

const STATUS_METADATA: Record<CompetitorNoteStatus, { title: string; description: string }> = {
  observation: {
    title: "Observations",
    description: "Raw intel collected from competitor channels or market signals.",
  },
  insight: {
    title: "Insights",
    description: "Analysis on what the intel might mean for our strategy or demand forecast.",
  },
  response: {
    title: "Planned Responses",
    description: "Coordinated moves, counter-actions, or experiments to run.",
  },
  watch: {
    title: "Watch List",
    description: "Items to monitor over the next round before committing resources.",
  },
};

const PRIORITY_COLORS: Record<CompetitorNotePriority, string> = {
  high: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
};

type DraftNote = {
  competitor: string;
  title: string;
  summary: string;
  status: CompetitorNoteStatus;
  priority: CompetitorNotePriority;
  focusRoles: string[];
};

const ROLE_OPTIONS: (Role | "Team Leader" | "All")[] = [
  "Sales",
  "Procurement",
  "Production",
  "Logistics",
  "Team Leader",
  "All",
];

function roleMatches(note: CompetitorNote, selectedRole: string) {
  if (selectedRole === "all") return true;
  if (note.focusRoles.includes("All")) return true;
  return note.focusRoles.includes(selectedRole);
}

export function CompetitorNoteBoard() {
  const { auth } = useFirebase();
  const { toast } = useToast();
  const { profile } = useAuth();

  const [notes, setNotes] = useState<CompetitorNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);
  const [activeColumn, setActiveColumn] = useState<CompetitorNoteStatus | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [draft, setDraft] = useState<DraftNote>({
    competitor: "",
    title: "",
    summary: "",
    status: "observation",
    priority: "medium",
    focusRoles: profile ? [profile.name] : ["All"],
  });
  const [roleFilter, setRoleFilter] = useState<string>(profile?.name ?? "all");

  useEffect(() => {
    setDraft((prev) => ({
      ...prev,
      focusRoles: profile ? [profile.name] : prev.focusRoles,
    }));
    setRoleFilter(profile?.name ?? "all");
  }, [profile]);

  const loadNotes = async () => {
    if (!auth?.currentUser) return;
    setIsLoading(true);
    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await listCompetitorNotesAction({ idToken });
      if (response.success) {
        setNotes(response.data as CompetitorNote[]);
      } else {
        toast({
          title: "Unable to load competitor notes",
          description: response.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Unable to load competitor notes",
        description: "We could not connect to Firestore.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!auth?.currentUser) return;
    loadNotes();
  }, [auth]);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => roleMatches(note, roleFilter));
  }, [notes, roleFilter]);

  const columnNotes = (status: CompetitorNoteStatus) =>
    filteredNotes
      .filter((note) => note.status === status)
      .sort((a, b) => b.order - a.order);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, noteId: string) => {
    setDraggedNoteId(noteId);
    event.dataTransfer.setData("text/plain", noteId);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedNoteId(null);
    setActiveColumn(null);
  };

  const handleDrop = async (
    event: React.DragEvent<HTMLDivElement>,
    status: CompetitorNoteStatus
  ) => {
    event.preventDefault();
    const noteId = event.dataTransfer.getData("text/plain") || draggedNoteId;
    setActiveColumn(null);
    setDraggedNoteId(null);
    if (!noteId) return;

    const target = notes.find((note) => note.id === noteId);
    if (!target || target.status === status) return;

    const previous = notes;
    const optimistic = notes.map((note) =>
      note.id === noteId
        ? {
            ...note,
            status,
            updatedAt: new Date().toISOString(),
            order: Date.now(),
          }
        : note
    );
    setNotes(optimistic);

    if (!auth?.currentUser) return;

    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await updateCompetitorNoteAction({
        idToken,
        id: noteId,
        updates: { status, order: Date.now() },
      });
      if (response.success) {
        setNotes((existing) =>
          existing.map((note) =>
            note.id === noteId ? (response.data as CompetitorNote) : note
          )
        );
      } else {
        setNotes(previous);
        toast({
          title: "Unable to update note",
          description: response.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      setNotes(previous);
      toast({
        title: "Unable to update note",
        description: "We could not update Firestore.",
        variant: "destructive",
      });
    }
  };

  const handleCreate = async () => {
    if (!auth?.currentUser || !profile) {
      toast({
        title: "Select a role first",
        description: "Choose your role before creating a competitor insight.",
        variant: "destructive",
      });
      return;
    }

    if (!draft.title.trim() || !draft.summary.trim() || !draft.competitor.trim()) {
      toast({
        title: "Missing details",
        description: "Competitor, headline, and summary are required.",
        variant: "destructive",
      });
      return;
    }

    const optimisticNote: CompetitorNote = {
      id: `temp-${Date.now()}`,
      teamId: "temp",
      ownerUid: auth.currentUser.uid,
      authorName: profile.name,
      competitor: draft.competitor.trim(),
      title: draft.title.trim(),
      summary: draft.summary.trim(),
      status: draft.status,
      priority: draft.priority,
      focusRoles: draft.focusRoles.length > 0 ? draft.focusRoles : [profile.name],
      order: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNotes((prev) => [optimisticNote, ...prev]);
    setIsDialogOpen(false);
    setDraft({
      competitor: "",
      title: "",
      summary: "",
      status: "observation",
      priority: "medium",
      focusRoles: profile ? [profile.name] : ["All"],
    });

    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await createCompetitorNoteAction({
        idToken,
        competitor: optimisticNote.competitor,
        title: optimisticNote.title,
        summary: optimisticNote.summary,
        status: optimisticNote.status,
        priority: optimisticNote.priority,
        focusRoles: optimisticNote.focusRoles,
        authorName: profile.name,
      });
      if (response.success) {
        setNotes((current) =>
          [response.data as CompetitorNote, ...current.filter((note) => note.id !== optimisticNote.id)]
        );
        toast({
          title: "Competitor note added",
          description: "Your insight is now shared with the team.",
        });
      } else {
        setNotes((current) => current.filter((note) => note.id !== optimisticNote.id));
        toast({
          title: "Unable to add note",
          description: response.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      setNotes((current) => current.filter((note) => note.id !== optimisticNote.id));
      toast({
        title: "Unable to add note",
        description: "We could not connect to Firestore.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (note: CompetitorNote) => {
    if (!auth?.currentUser) return;
    const previous = notes;
    setNotes((current) => current.filter((entry) => entry.id !== note.id));
    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await deleteCompetitorNoteAction({ idToken, id: note.id });
      if (!response.success) {
        setNotes(previous);
        toast({
          title: "Unable to delete note",
          description: response.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      setNotes(previous);
      toast({
        title: "Unable to delete note",
        description: "We could not connect to Firestore.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="font-headline text-2xl">Competitor Strategy Board</CardTitle>
          <CardDescription>
            Drag and drop competitor intel through the analysis pipeline so everyone sees the latest plays.
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All intel</SelectItem>
              {ROLE_OPTIONS.filter((role) => role !== "All").map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Capture new competitor intel</DialogTitle>
                <DialogDescription>
                  Summarize what you observed and who needs to act on it.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="note-competitor">
                    Competitor or product line
                  </label>
                  <Input
                    id="note-competitor"
                    placeholder="e.g., Team Orion - Premium SKU"
                    value={draft.competitor}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, competitor: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="note-title">
                    Headline insight
                  </label>
                  <Input
                    id="note-title"
                    placeholder="Competitor dropped price by 8% on VK32"
                    value={draft.title}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, title: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="note-summary">
                    Summary & implications
                  </label>
                  <Textarea
                    id="note-summary"
                    placeholder="Describe the signal, potential intent, and what we should watch next round."
                    value={draft.summary}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, summary: event.target.value }))
                    }
                    rows={4}
                  />
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Status lane</label>
                    <Select
                      value={draft.status}
                      onValueChange={(value) =>
                        setDraft((prev) => ({ ...prev, status: value as CompetitorNoteStatus }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="observation">Observation</SelectItem>
                        <SelectItem value="insight">Insight</SelectItem>
                        <SelectItem value="response">Planned Response</SelectItem>
                        <SelectItem value="watch">Watch List</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Priority</label>
                    <Select
                      value={draft.priority}
                      onValueChange={(value) =>
                        setDraft((prev) => ({ ...prev, priority: value as CompetitorNotePriority }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium">Share with roles</span>
                  <div className="grid grid-cols-2 gap-2">
                    {ROLE_OPTIONS.map((role) => {
                      const checked = draft.focusRoles.includes(role);
                      return (
                        <label key={role} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) => {
                              setDraft((prev) => {
                                const nextRoles = new Set(prev.focusRoles);
                                if (value) {
                                  if (role === "All") {
                                    return { ...prev, focusRoles: ["All"] };
                                  }
                                  nextRoles.delete("All");
                                  nextRoles.add(role);
                                } else {
                                  nextRoles.delete(role);
                                }
                                return { ...prev, focusRoles: Array.from(nextRoles) };
                              });
                            }}
                          />
                          {role === "All" ? "All roles" : role}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate}>Create note</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Syncing competitor intel...
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-4">
            {STATUSES.map((status) => {
              const column = columnNotes(status);
              const metadata = STATUS_METADATA[status];
              const isActive = activeColumn === status;

              return (
                <div
                  key={status}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setActiveColumn(status);
                  }}
                  onDragLeave={() => setActiveColumn(null)}
                  onDrop={(event) => handleDrop(event, status)}
                  className={`flex min-h-[320px] flex-col gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 transition-colors ${
                    isActive ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{metadata.title}</h3>
                      <span className="text-xs text-muted-foreground">{column.length}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{metadata.description}</p>
                  </div>
                  <div className="flex flex-1 flex-col gap-3">
                    {column.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border/60 bg-background/50 p-4 text-center text-xs text-muted-foreground">
                        Drop competitor notes here as they progress through the analysis pipeline.
                      </div>
                    ) : (
                      column.map((note) => (
                        <div
                          key={note.id}
                          draggable
                          onDragStart={(event) => handleDragStart(event, note.id)}
                          onDragEnd={handleDragEnd}
                          className="cursor-grab rounded-lg border border-border/50 bg-background p-4 shadow-sm transition hover:border-primary"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold leading-tight">{note.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-3">{note.summary}</p>
                              <p className="text-xs text-muted-foreground">
                                Source: <span className="font-medium">{note.competitor}</span>
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge className={PRIORITY_COLORS[note.priority]}>{note.priority}</Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDelete(note)}
                                aria-label="Delete competitor note"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="rounded-md bg-muted px-2 py-1 uppercase tracking-wide">
                              {note.authorName}
                            </span>
                            <span>
                              Updated {new Date(note.updatedAt).toLocaleString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span className="flex flex-wrap gap-1">
                              {note.focusRoles.map((role) => (
                                <Badge key={role} variant="secondary" className="text-[10px]">
                                  {role === "All" ? "All roles" : role}
                                </Badge>
                              ))}
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
