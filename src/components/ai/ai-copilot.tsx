"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bot, Loader2, Send, Sparkles, User } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { useGameState, useActionItems, useCompetitorLog } from "@/hooks/use-game-data";
import { answerCopilotQuestionAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback } from "../ui/avatar";
import Markdown from 'react-markdown';


type Message = {
  role: "user" | "assistant";
  content: string;
};

export function AiCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const { gameState } = useGameState();
  const { actionItems } = useActionItems();
  const { logEntries } = useCompetitorLog();
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const result = await answerCopilotQuestionAction({
      question: input,
      companyValuation: gameState.companyValuation,
      netIncome: gameState.netIncome,
      inventoryValue: gameState.inventoryValue,
      totalEmissions: gameState.totalEmissions,
      teamStrategy: gameState.teamStrategy,
      competitorAnalysisLog: JSON.stringify(logEntries.slice(0, 5)), // Send recent 5 logs
    });

    setIsLoading(false);

    if (result.success && result.data) {
      const assistantMessage: Message = {
        role: "assistant",
        content: result.data.answer,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } else {
      toast({
        variant: "destructive",
        title: "Copilot Error",
        description: result.error,
      });
       setMessages((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button size="icon" className="rounded-full w-14 h-14 shadow-lg bg-accent hover:bg-accent/90 text-accent-foreground">
            <Sparkles className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 font-headline">
              <Bot /> AI Copilot
            </SheetTitle>
            <SheetDescription>
              Ask questions about the game, your performance, or strategy.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-1 my-4 pr-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    message.role === "user" ? "justify-end" : ""
                  }`}
                >
                    {message.role === "assistant" && (
                         <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                            <AvatarFallback><Bot size={18} /></AvatarFallback>
                        </Avatar>
                    )}
                  <div
                    className={`rounded-lg p-3 max-w-sm text-sm ${
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
                         <Avatar className="w-8 h-8">
                            <AvatarFallback><User size={18} /></AvatarFallback>
                        </Avatar>
                    )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                        <AvatarFallback><Bot size={18} /></AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 bg-secondary">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <SheetFooter>
            <div className="flex gap-2 w-full">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask the AI..."
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                    }
                }}
                className="flex-1"
                rows={1}
              />
              <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
