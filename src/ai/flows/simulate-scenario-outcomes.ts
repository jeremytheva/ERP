'use server';
/**
 * @fileOverview Simulates scenario outcomes based on user-defined variables.
 *
 * - simulateScenarioOutcomes - Simulates the financial outcomes of various scenarios.
 * - SimulateScenarioInput - The input type for the simulateScenarioOutcomes function.
 * - SimulateScenarioOutput - The return type for the simulateScenarioOutcomes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimulateScenarioInputSchema = z.object({
  marketingSpend: z.number().describe('The amount of money spent on marketing.'),
  productionVolume: z.number().describe('The volume of products produced.'),
  currentGameState: z.string().describe('The current state of the game, including company KPIs.'),
});
export type SimulateScenarioInput = z.infer<typeof SimulateScenarioInputSchema>;

const SimulateScenarioOutputSchema = z.object({
  predictedCompanyValuation: z.number().describe('The predicted company valuation after the scenario.'),
  predictedNetIncome: z.number().describe('The predicted net income after the scenario.'),
  predictedInventoryValue: z.number().describe('The predicted inventory value after the scenario.'),
  predictedTotalEmissions: z.number().describe('The predicted total emissions after the scenario.'),
});
export type SimulateScenarioOutput = z.infer<typeof SimulateScenarioOutputSchema>;

export async function simulateScenarioOutcomes(input: SimulateScenarioInput): Promise<SimulateScenarioOutput> {
  return simulateScenarioOutcomesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simulateScenarioOutcomesPrompt',
  input: {schema: SimulateScenarioInputSchema},
  output: {schema: SimulateScenarioOutputSchema},
  prompt: `You are a financial analyst specializing in predicting business outcomes based on scenario inputs.

  Based on the current game state and the provided scenario, predict the impact on key company KPIs.

  Current Game State: {{{currentGameState}}}
  Marketing Spend: {{{marketingSpend}}}
  Production Volume: {{{productionVolume}}}

  Consider all factors and provide realistic predictions for:
  - predictedCompanyValuation
  - predictedNetIncome
  - predictedInventoryValue
  - predictedTotalEmissions`,
});

const simulateScenarioOutcomesFlow = ai.defineFlow(
  {
    name: 'simulateScenarioOutcomesFlow',
    inputSchema: SimulateScenarioInputSchema,
    outputSchema: SimulateScenarioOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
