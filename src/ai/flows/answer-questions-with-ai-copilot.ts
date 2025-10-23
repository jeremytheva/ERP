'use server';

/**
 * @fileOverview An AI copilot that answers questions about the game.
 *
 * - answerQuestionsWithAICopilot - A function that answers questions about the game.
 * - AnswerQuestionsWithAICopilotInput - The input type for the answerQuestionsWithAICopilot function.
 * - AnswerQuestionsWithAICopilotOutput - The return type for the answerQuestionsWithAICopilot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerQuestionsWithAICopilotInputSchema = z.object({
  question: z.string().describe('The question to ask the AI copilot.'),
  companyValuation: z.number().describe('The company valuation.'),
  netIncome: z.number().describe('The net income.'),
  inventoryValue: z.number().describe('The inventory value.'),
  totalEmissions: z.number().describe('The total emissions.'),
  teamStrategy: z.string().describe('The team strategy.'),
  competitorAnalysisLog: z.string().describe('The competitor analysis log.'),
});
export type AnswerQuestionsWithAICopilotInput = z.infer<typeof AnswerQuestionsWithAICopilotInputSchema>;

const AnswerQuestionsWithAICopilotOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type AnswerQuestionsWithAICopilotOutput = z.infer<typeof AnswerQuestionsWithAICopilotOutputSchema>;

export async function answerQuestionsWithAICopilot(input: AnswerQuestionsWithAICopilotInput): Promise<AnswerQuestionsWithAICopilotOutput> {
  return answerQuestionsWithAICopilotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerQuestionsWithAICopilotPrompt',
  input: {schema: AnswerQuestionsWithAICopilotInputSchema},
  output: {schema: AnswerQuestionsWithAICopilotOutputSchema},
  prompt: `You are an AI copilot that answers questions about the game, our company\'s performance, or potential strategies.

  Here is some information about the game and our company:

  Company Valuation: {{{companyValuation}}}
  Net Income: {{{netIncome}}}
  Inventory Value: {{{inventoryValue}}}
  Total Emissions: {{{totalEmissions}}}
  Team Strategy: {{{teamStrategy}}}
  Competitor Analysis Log: {{{competitorAnalysisLog}}}

  Answer the following question:

  {{{question}}}`,
});

const answerQuestionsWithAICopilotFlow = ai.defineFlow(
  {
    name: 'answerQuestionsWithAICopilotFlow',
    inputSchema: AnswerQuestionsWithAICopilotInputSchema,
    outputSchema: AnswerQuestionsWithAICopilotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
