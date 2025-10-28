"use client";

import { FormEvent, useMemo, useState } from "react";
import Markdown from "react-markdown";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles, Bot, User, Loader2, Send, Info } from "lucide-react";
import { useGameState } from "@/hooks/use-game-data";
import { useCompetitorLog } from "@/hooks/use-competitor-log";
import { useCompetitorNotes } from "@/hooks/use-competitor-notes";
import { useCopilotContext } from "@/hooks/use-copilot-context";
import { answerCopilotQuestionAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function CopilotChatWindow() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [includeContext, setIncludeContext] = useState(true);
  const [includeCompetitorNotes, setIncludeCompetitorNotes] = useState(true);
  const [includeLogs, setIncludeLogs] = useState(true);

  const { gameState } = useGameState();
  const { logEntries } = useCompetitorLog();
  const { notes } = useCompetitorNotes();
  const { context, isLoading: isContextLoading } = useCopilotContext();
  const { toast } = useToast();

  const competitorContext = useMemo(() => {
    const logSummary = includeLogs
      ? logEntries
          .slice(0, 5)
          .map((entry) => `${entry.author}: ${entry.text}`)
          .join("\n")
      : "";

    const noteSummary = includeCompetitorNotes
      ? notes
          .slice(0, 5)
          .map(
            (note) =>
              `${note.title} [${note.status}]${note.role ? ` <${note.role}>` : ""}: ${note.summary}`
          )
          .join("\n")
      : "";

    return [logSummary, noteSummary].filter(Boolean).join("\n\n");
  }, [includeLogs, includeCompetitorNotes, logEntries, notes]);

  const enrichedQuestion = useMemo(() => {
    const segments: string[] = [];
    if (includeContext && context) {
      segments.push(`Reference Context:\n${context}`);
    }
    segments.push(`User Question: ${input.trim()}`);
    return segments.join("\n\n");
  }, [context, includeContext, input]);

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await answerCopilotQuestionAction({
        question: enrichedQuestion,
        companyValuation: gameState.companyValuation,
        netIncome: gameState.netIncome,
        inventoryValue: gameState.inventoryValue,
        totalEmissions: gameState.cumulativeCO2eEmissions,
        teamStrategy: gameState.teamStrategy,
        competitorAnalysisLog: competitorContext || "No competitor context provided.",
      });

      if (result.success && result.data) {
        setMessages((prev) => [...prev, { role: "assistant", content: result.data.answer }]);
      } else {
        setMessages((prev) => prev.slice(0, -1));
        toast({
          variant: "destructive",
          title: "Copilot error",
          description: result.error ?? "The copilot was unable to respond.",
        });
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => prev.slice(0, -1));
      toast({
        variant: "destructive",
        title: "Copilot error",
        description: "We couldn't reach the copilot. Please try again.",
      });
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
        <SheetContent className="flex h-full max-h-[90vh] flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" /> Copilot Assistant
            </SheetTitle>
            <SheetDescription>
              Ask for tailored insights using game data, competitor logs, and optional context notes.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 space-y-4 rounded-md border bg-muted/30 p-3 text-xs">
            <div className="flex items-center gap-2">
              <Switch
                id="context"
                checked={includeContext && Boolean(context)}
                onCheckedChange={(checked) => setIncludeContext(Boolean(context) && checked)}
                disabled={!context || isContextLoading}
              />
              <Label htmlFor="context" className="flex items-center gap-1">
                <Info className="h-3.5 w-3.5" />
                Inject docs/context-injection.md
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="competitor-notes"
                checked={includeCompetitorNotes}
                onCheckedChange={setIncludeCompetitorNotes}
              />
              <Label htmlFor="competitor-notes">Include competitor board notes</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="competitor-logs" checked={includeLogs} onCheckedChange={setIncludeLogs} />
              <Label htmlFor="competitor-logs">Include competitor log entries</Label>
            </div>
          </div>

          <ScrollArea className="mt-4 flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${message.role === "user" ? "justify-end" : ""}`}
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
                        : "bg-secondary text-secondary-foreground"
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
            <form onSubmit={handleSubmit} className="flex w-full items-end gap-2">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask the copilot..."
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSubmit(event);
                  }
                }}
                rows={2}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
