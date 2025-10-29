"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Loader2, RefreshCw, Send, Sparkles, User } from "lucide-react";
import Markdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";
import { copilotChatAction } from "@/lib/actions";
import { useGameState } from "@/hooks/use-game-data";
import { useCompetitorLog } from "@/hooks/use-competitor-log";
import { useFirebase } from "@/firebase";
import { useAuth } from "@/hooks/use-auth";
import { listActionItemsAction, listCompetitorNotesAction } from "@/lib/firestore-actions";
import type { ActionItem, CompetitorNote } from "@/types";

export type CopilotMessage = {
  role: "user" | "assistant";
  content: string;
};

export function CopilotChatWindow() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [actionItemSummary, setActionItemSummary] = useState<string>("");
  const [noteSummary, setNoteSummary] = useState<string>("");
  const [isContextLoading, setIsContextLoading] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);
  const [contextUpdatedAt, setContextUpdatedAt] = useState<string | null>(null);

  const { toast } = useToast();
  const { gameState } = useGameState();
  const { logEntries } = useCompetitorLog();
  const { auth } = useFirebase();
  const { profile } = useAuth();

  const loadContext = useCallback(async () => {
    if (!auth?.currentUser) return;
    setIsContextLoading(true);
    setContextError(null);
    try {
      const idToken = await auth.currentUser.getIdToken();
      const [actionItemsResponse, competitorNotesResponse] = await Promise.all([
        listActionItemsAction({ idToken }),
        listCompetitorNotesAction({ idToken }),
      ]);
      let didUpdate = false;
      if (actionItemsResponse.success) {
        setActionItemSummary(summarizeActionItems(actionItemsResponse.data as ActionItem[]));
        didUpdate = true;
      } else {
        setContextError((previous) =>
          previous ? `${previous}; ${actionItemsResponse.error}` : actionItemsResponse.error
        );
      }
      if (competitorNotesResponse.success) {
        setNoteSummary(summarizeCompetitorNotes(competitorNotesResponse.data as CompetitorNote[]));
        didUpdate = true;
      } else {
        setContextError((previous) =>
          previous ? `${previous}; ${competitorNotesResponse.error}` : competitorNotesResponse.error
        );
      }
      if (didUpdate) {
        setContextUpdatedAt(new Date().toISOString());
      }
    } catch (error) {
      console.error(error);
      setContextError("Unable to refresh copilot context from Firestore.");
    } finally {
      setIsContextLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    loadContext();
  }, [isOpen, loadContext]);

  const gameSnapshot = useMemo(() => {
    const snapshot = {
      companyValuation: gameState.companyValuation,
      netIncome: gameState.netIncome,
      inventoryValue: gameState.inventoryValue,
      cashBalance: gameState.cashBalance,
      marketShare: gameState.marketShare,
      teamStrategy: gameState.teamStrategy,
      currentRound: gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round ?? 1,
    };
    return JSON.stringify(snapshot, null, 2);
  }, [gameState]);

  const competitorLogContext = useMemo(() => {
    return logEntries
      .slice(0, 5)
      .map((entry) => `- ${entry.author}: ${entry.text}`)
      .join("\n");
  }, [logEntries]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage: CopilotMessage = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await copilotChatAction({
        messages: nextMessages,
        context: {
          gameSnapshot,
          competitorLog: competitorLogContext,
          actionItems: actionItemSummary,
          competitorNotes: noteSummary,
          additional: profile ? `Current role: ${profile.name}` : undefined,
        },
      });
      if (response.success && response.data) {
        setMessages((prev) => [...prev, { role: "assistant", content: response.data.reply }]);
      } else {
        toast({
          title: "Copilot error",
          description: response.error,
          variant: "destructive",
        });
        setMessages((prev) => prev.slice(0, -1));
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Copilot error",
        description: "We could not contact the copilot service.",
        variant: "destructive",
      });
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <Button
          size="icon"
          className="h-14 w-14 rounded-full bg-accent text-accent-foreground shadow-lg hover:bg-accent/90"
          onClick={() => setIsOpen(true)}
        >
          <Sparkles className="h-6 w-6" />
        </Button>
        <SheetContent className="flex h-full w-full max-w-lg flex-col">
          <SheetHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <SheetTitle className="flex items-center gap-2 font-headline">
                  <Bot /> Copilot Workspace
                </SheetTitle>
                <SheetDescription>
                  Ask follow-up questions about KPIs, team commitments, and competitor plays.
                </SheetDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={loadContext}
                disabled={isContextLoading || !auth?.currentUser}
                aria-label="Refresh copilot context"
              >
                <RefreshCw className={`h-4 w-4 ${isContextLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
            {contextUpdatedAt && (
              <p className="text-xs text-muted-foreground">
                Context synced {new Date(contextUpdatedAt).toLocaleString()}
              </p>
            )}
            {contextError && (
              <p className="text-xs text-destructive">{contextError}</p>
            )}
          </SheetHeader>
          <ScrollArea className="mt-4 flex-1 pr-3">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex items-start gap-3 ${
                    message.role === "user" ? "justify-end" : ""
                  }`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-sm rounded-lg p-3 text-sm ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary"
                    }`}
                  >
                    <article className="prose prose-sm dark:prose-invert max-w-none">
                      <Markdown>{message.content}</Markdown>
                    </article>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg bg-secondary p-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <SheetFooter>
            <div className="flex w-full items-end gap-2">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask the copilot..."
                rows={2}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function summarizeActionItems(items: ActionItem[]): string {
  if (!items.length) return "No action items captured yet.";
  return items
    .slice(0, 8)
    .map(
      (item) =>
        `- [${item.status}] ${item.title} (${item.ownerRole}) priority:${item.priority}`
    )
    .join("\n");
}

function summarizeCompetitorNotes(notes: CompetitorNote[]): string {
  if (!notes.length) return "No competitor notes available.";
  return notes
    .slice(0, 8)
    .map(
      (note) =>
        `- [${note.status}] ${note.title} (${note.competitor}) → focus: ${note.focusRoles.join(", ")}`
    )
    .join("\n");
}
