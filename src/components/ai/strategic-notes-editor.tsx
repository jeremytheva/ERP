"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  collection,
  orderBy,
  query,
  where,
  type Query,
  type DocumentData,
} from "firebase/firestore";
import { Loader2, Save, FileText } from "lucide-react";

import { useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { DEFAULT_GAME_ID } from "@/lib/logic/constants";
import type { StrategyDocument } from "@/lib/zod-schemas";
import { updateStrategyNotesAction } from "@/lib/logic/server-actions";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type StrategicNotesEditorProps = {
  gameId?: string;
};

export function StrategicNotesEditor({ gameId = DEFAULT_GAME_ID }: StrategicNotesEditorProps) {
  const firestore = useFirestore();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);
  const [draftNotes, setDraftNotes] = useState<string>("");
  const [optimisticNotes, setOptimisticNotes] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const strategiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const col = collection(firestore, "strategies");
    return query(
      col,
      where("gameId", "==", gameId),
      orderBy("createdAt", "desc")
    ) as Query<DocumentData>;
  }, [firestore, gameId]);

  const { data, isLoading } = useCollection<StrategyDocument>(strategiesQuery);

  const selectedStrategy = useMemo(() => {
    if (!selectedStrategyId) return null;
    const fromSnapshot = data?.find((item) => item.id === selectedStrategyId) ?? null;
    if (!fromSnapshot) return null;
    const optimistic = optimisticNotes[selectedStrategyId];
    return optimistic !== undefined
      ? { ...fromSnapshot, notes: optimistic }
      : fromSnapshot;
  }, [data, selectedStrategyId, optimisticNotes]);

  useEffect(() => {
    if (!selectedStrategyId && data && data.length > 0) {
      setSelectedStrategyId(data[0].id);
    }
  }, [data, selectedStrategyId]);

  useEffect(() => {
    if (!selectedStrategy) {
      setDraftNotes("");
      return;
    }
    setDraftNotes(selectedStrategy.notes ?? "");
  }, [selectedStrategy?.id, selectedStrategy?.notes]);

  useEffect(() => {
    if (!data) return;
    setOptimisticNotes((prev) => {
      const next = { ...prev };
      for (const id of Object.keys(next)) {
        const snapshotNotes = data.find((item) => item.id === id)?.notes;
        if (snapshotNotes === next[id]) {
          delete next[id];
        }
      }
      return next;
    });
  }, [data]);

  const handleSave = () => {
    if (!selectedStrategy) return;
    const trimmed = draftNotes.trim();
    startTransition(() => {
      setOptimisticNotes((prev) => ({ ...prev, [selectedStrategy.id]: trimmed }));
      updateStrategyNotesAction({
        strategyId: selectedStrategy.id,
        notes: trimmed,
        authorId: user?.uid ?? profile?.id ?? "anonymous",
      })
        .then(() => {
          toast({
            title: "Notes Updated",
            description: "Your updates have been saved for the team.",
          });
        })
        .catch((error) => {
          console.error(error);
          toast({
            variant: "destructive",
            title: "Update Failed",
            description: "We couldn't save the notes. Please try again.",
          });
          setOptimisticNotes((prev) => {
            const next = { ...prev };
            delete next[selectedStrategy.id];
            return next;
          });
        });
    });
  };

  if (isLoading && (!data || data.length === 0)) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!data || data.length === 0) {
    return (
      <Card className="bg-secondary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <FileText className="h-4 w-4" /> Strategic Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Generate a scenario to unlock shared notes. You can capture rationale and follow-ups for each strategy here.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <FileText className="h-4 w-4" /> Strategic Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          value={selectedStrategyId ?? undefined}
          onValueChange={(value) => setSelectedStrategyId(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a saved scenario" />
          </SelectTrigger>
          <SelectContent>
            {data?.map((strategy) => (
              <SelectItem key={strategy.id} value={strategy.id}>
                {strategy.scenario.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Textarea
          value={draftNotes}
          onChange={(event) => setDraftNotes(event.target.value)}
          placeholder="Capture context, negotiation cues, or follow-up actions for this scenario."
          className="min-h-[180px]"
        />

        <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
          {optimisticNotes[selectedStrategyId ?? ""] && <span>Saving...</span>}
          <Button
            type="button"
            onClick={handleSave}
            disabled={isPending || !selectedStrategy}
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Notes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
