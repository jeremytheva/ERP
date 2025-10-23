'use server';

/**
 * @fileOverview Generates a summary report at the end of each round, including performance data,
 * competitor analysis, and action items.
 *
 * - generateRoundDebriefing - A function that handles the generation of the round debriefing report.
 * - GenerateRoundDebriefingInput - The input type for the generateRoundDebriefing function.
 * - GenerateRoundDebriefingOutput - The return type for the generateRoundDebriefing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRoundDebriefingInputSchema = z.object({
  performanceData: z.string().describe('Performance data for the round.'),
  competitorAnalysis: z.string().describe('Competitor analysis for the round.'),
  actionItems: z.string().describe('Action items identified during the round.'),
});
export type GenerateRoundDebriefingInput = z.infer<typeof GenerateRoundDebriefingInputSchema>;

const GenerateRoundDebriefingOutputSchema = z.object({
  summaryReport: z.string().describe('A summary report of the round debriefing.'),
});
export type GenerateRoundDebriefingOutput = z.infer<typeof GenerateRoundDebriefingOutputSchema>;

export async function generateRoundDebriefing(input: GenerateRoundDebriefingInput): Promise<GenerateRoundDebriefingOutput> {
  return generateRoundDebriefingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRoundDebriefingPrompt',
  input: {schema: GenerateRoundDebriefingInputSchema},
  output: {schema: GenerateRoundDebriefingOutputSchema},
  prompt: `You are an expert business analyst summarizing the events of a business simulation round.

  You will receive performance data, competitor analysis, and action items. You will use this information to generate a summary report that includes key insights and areas for improvement.

  Performance Data: {{{performanceData}}}
  Competitor Analysis: {{{competitorAnalysis}}}
  Action Items: {{{actionItems}}}

  Generate a concise and actionable summary report.
  `,
});

const generateRoundDebriefingFlow = ai.defineFlow(
  {
    name: 'generateRoundDebriefingFlow',
    inputSchema: GenerateRoundDebriefingInputSchema,
    outputSchema: GenerateRoundDebriefingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
