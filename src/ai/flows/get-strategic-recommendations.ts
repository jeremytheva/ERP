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
  totalEmissions: z.number().describe('The total emissions.'),
  competitorAnalysisLog: z.string().describe('The competitor analysis log.'),
});
export type StrategicRecommendationsInput = z.infer<typeof StrategicRecommendationsInputSchema>;

const StrategicRecommendationsOutputSchema = z.object({
  recommendations: z.string().describe('Actionable recommendations to improve performance.'),
});
export type StrategicRecommendationsOutput = z.infer<typeof StrategicRecommendationsOutputSchema>;

export async function getStrategicRecommendations(input: StrategicRecommendationsInput): Promise<StrategicRecommendationsOutput> {
  return getStrategicRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'strategicRecommendationsPrompt',
  input: {schema: StrategicRecommendationsInputSchema},
  output: {schema: StrategicRecommendationsOutputSchema},
  prompt: `You are a strategic advisor for a business simulation game. Analyze the current game state and the team's strategy to provide actionable recommendations.\n\nCurrent Game State: {{{gameState}}}\nCompany Valuation: {{{companyValuation}}}\nNet Income: {{{netIncome}}}\nInventory Value: {{{inventoryValue}}}\nTotal Emissions: {{{totalEmissions}}}\nTeam Strategy: {{{teamStrategy}}}\nCompetitor Analysis Log: {{{competitorAnalysisLog}}}\n\nProvide specific and actionable recommendations to improve the team's performance and achieve their goals. Focus on key areas such as resource management, market positioning, and competitive advantage. Consider the competitor analysis log when making recommendations. `,
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
