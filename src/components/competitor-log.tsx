"use client";

import { useState } from "react";
import { useCompetitorLog } from "@/hooks/use-game-data";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { USER_PROFILES } from "@/lib/mock-data";
import { Send } from "lucide-react";

export function CompetitorLog() {
  const { logEntries, addLogEntry } = useCompetitorLog();
  const { profile } = useAuth();
  const [newEntryText, setNewEntryText] = useState("");

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEntryText.trim() && profile) {
      addLogEntry(newEntryText.trim(), profile.name);
      setNewEntryText("");
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddEntry} className="space-y-2">
        <Textarea
          value={newEntryText}
          onChange={(e) => setNewEntryText(e.target.value)}
          placeholder="Add a new observation about a competitor..."
        />
        <div className="flex justify-end">
            <Button type="submit" disabled={!newEntryText.trim() || !profile}>
                <Send className="h-4 w-4 mr-2" />
                Add Entry
            </Button>
        </div>
      </form>

      <div className="space-y-4">
        {logEntries.map((entry) => {
            const authorProfile = USER_PROFILES.find(p => p.name === entry.author);
            return (
                <div key={entry.id} className="flex gap-3">
                    <Avatar>
                        <AvatarImage src={authorProfile?.avatarUrl} alt={entry.author}/>
                        <AvatarFallback>{entry.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">{entry.author}</p>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(entry.createdAt, { addSuffix: true })}
                            </p>
                        </div>
                        <p className="text-sm bg-secondary/50 p-3 rounded-md">{entry.text}</p>
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
}
