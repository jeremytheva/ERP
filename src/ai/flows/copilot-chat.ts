"use server";

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import { promises as fs } from "fs";
import path from "path";

const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const ChatContextSchema = z.object({
  gameSnapshot: z.string().optional(),
  competitorLog: z.string().optional(),
  actionItems: z.string().optional(),
  competitorNotes: z.string().optional(),
  additional: z.string().optional(),
});

const CopilotChatInputSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1),
  context: ChatContextSchema.optional(),
});

const CopilotChatOutputSchema = z.object({
  reply: z.string(),
});

export type CopilotChatInput = z.infer<typeof CopilotChatInputSchema>;
export type CopilotChatOutput = z.infer<typeof CopilotChatOutputSchema>;
export type CopilotChatMessage = z.infer<typeof ChatMessageSchema>;

async function loadContextInjectionFile(): Promise<string | null> {
  const docPath = path.join(process.cwd(), "docs", "context-injection.md");
  try {
    const content = await fs.readFile(docPath, "utf-8");
    return content.trim().length > 0 ? content : null;
  } catch (error) {
    return null;
  }
}

async function buildContext(context?: z.infer<typeof ChatContextSchema>): Promise<string> {
  const segments: string[] = [];
  const referenceDoc = await loadContextInjectionFile();
  if (referenceDoc) {
    segments.push(`Reference material from docs/context-injection.md:\n${referenceDoc}`);
  }
  if (!context) {
    return segments.join("\n\n");
  }
  if (context.gameSnapshot) {
    segments.push(`Current game snapshot:\n${context.gameSnapshot}`);
  }
  if (context.actionItems) {
    segments.push(`Action items summary:\n${context.actionItems}`);
  }
  if (context.competitorLog) {
    segments.push(`Recent competitor analysis log:\n${context.competitorLog}`);
  }
  if (context.competitorNotes) {
    segments.push(`Competitor insight board:\n${context.competitorNotes}`);
  }
  if (context.additional) {
    segments.push(`Additional context:\n${context.additional}`);
  }
  return segments.join("\n\n");
}

const copilotPrompt = ai.definePrompt({
  name: "copilotChatPrompt",
  input: {
    schema: z.object({
      conversation: z.array(ChatMessageSchema),
      compiledContext: z.string().optional(),
    }),
  },
  output: { schema: CopilotChatOutputSchema },
  prompt: `You are the ERPsim strategic copilot embedded with the team. Maintain continuity across turns and always ground your reply in the supplied context.\n\nContext to consider:\n{{{compiledContext}}}\n\nConversation so far:\n\`\`\`json\n{{{json conversation}}}\n\`\`\`\n\nRespond as a trusted advisor. Focus on implications, next steps, and trade-offs. Provide actionable guidance in markdown.`,
});

const copilotChatFlow = ai.defineFlow(
  {
    name: "copilotChatFlow",
    inputSchema: CopilotChatInputSchema,
    outputSchema: CopilotChatOutputSchema,
  },
  async (input) => {
    const compiledContext = await buildContext(input.context);
    const { output } = await copilotPrompt({
      conversation: input.messages,
      compiledContext,
    });
    if (!output) {
      throw new Error("Copilot chat flow did not return a response.");
    }
    return output;
  }
);

export async function runCopilotChat(input: CopilotChatInput): Promise<CopilotChatOutput> {
  return copilotChatFlow(input);
}
