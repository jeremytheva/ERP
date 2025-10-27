
'use server';
/**
 * @fileOverview This file defines a Genkit flow for providing strategic recommendations based on the current game state and team strategy.
 *
 * - getStrategicRecommendations - A function that retrieves strategic recommendations.
 * - StrategicRecommendationsInput - The input type for the getStrategicRecommendations function.
 * - StrategicRecommendationsOutput - The return type for the getStrategicRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StrategicRecommendationsInputSchema = z.object({
  gameState: z.string().describe('The current state of the game.'),
  teamStrategy: z.string().describe('The current strategy of the team.'),
  companyValuation: z.number().describe('The company valuation.'),
  netIncome: z.number().describe('The net income.'),
  inventoryValue: z.number().describe('The inventory value.'),
  totalEmissions: z.number().describe('The total cumulative CO₂e emissions in kg.'),
  competitorAnalysisLog: z.string().describe('A JSON array of the latest competitor analysis log entries.'),
});
export type StrategicRecommendationsInput = z.infer<typeof StrategicRecommendationsInputSchema>;

const StrategicRecommendationsOutputSchema = z.object({
  recommendations: z.string().describe('Actionable recommendations to improve performance. The response should be formatted as a markdown list.'),
});
export type StrategicRecommendationsOutput = z.infer<typeof StrategicRecommendationsOutputSchema>;

export async function getStrategicRecommendations(input: StrategicRecommendationsInput): Promise<StrategicRecommendationsOutput> {
  return getStrategicRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'strategicRecommendationsPrompt',
  input: {schema: StrategicRecommendationsInputSchema},
  output: {schema: StrategicRecommendationsOutputSchema},
  prompt: `You are a strategic advisor for a business simulation game. Analyze the current game state, the team's strategy, and the competitor analysis log to provide actionable recommendations.

Current Game State:
\`\`\`json
{{{gameState}}}
\`\`\`

Key Metrics:
- Company Valuation: {{{companyValuation}}}
- Net Income: {{{netIncome}}}
- Inventory Value: {{{inventoryValue}}}
- Total Emissions: {{{totalEmissions}}} kg CO₂e

Team Strategy: "{{{teamStrategy}}}"

Recent Competitor Analysis Log:
\`\`\`json
{{{competitorAnalysisLog}}}
\`\`\`

Provide specific and actionable recommendations as a markdown list to improve the team's performance and achieve their goals. Focus on key areas such as resource management, market positioning, and competitive advantage. Consider the competitor analysis log when making recommendations. `,
});

const getStrategicRecommendationsFlow = ai.defineFlow(
  {
    name: 'getStrategicRecommendationsFlow',
    inputSchema: StrategicRecommendationsInputSchema,
    outputSchema: StrategicRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
