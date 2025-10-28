"use client";

import { useEffect, useState, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLatestStrategy } from "@/hooks/use-strategic-ai";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function StrategicNotesEditor() {
  const { strategy, updateNotes, isLoading } = useLatestStrategy();
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    setNotes(strategy?.notes ?? "");
  }, [strategy?.notes]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
        <div className="h-24 rounded bg-muted animate-pulse" />
      </div>
    );
  }

  if (!strategy) {
    return (
      <p className="text-sm text-muted-foreground">
        Notes will be available once a scenario has been saved.
      </p>
    );
  }

  const handleSave = () => {
    const newNotes = notes.trim();
    startTransition(async () => {
      try {
        await updateNotes(newNotes);
        toast({
          title: "Notes updated",
          description: "Your annotations were saved for the team.",
        });
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Failed to save notes",
          description: "We could not update the shared strategy notes.",
        });
        setNotes(strategy.notes ?? "");
      }
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-base font-semibold font-headline">Team Notes</h4>
        <p className="text-xs text-muted-foreground">
          Capture alignment decisions or follow-ups related to this scenario.
        </p>
      </div>
      <Textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Add context for the next round..."
        rows={6}
      />
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Save Notes
        </Button>
      </div>
    </div>
  );
}

