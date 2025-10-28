
'use server';
/**
 * @fileOverview Suggests optimized inputs for a given task based on the current game state.
 *
 * - suggestOptimizedTaskInputs - A function that analyzes a task and suggests optimized inputs.
 * - SuggestOptimizedTaskInputsInput - The input type for the suggestOptimizedTaskInputs function.
 * - SuggestOptimizedTaskInputsOutput - The return type for the suggestOptimizedTaskInputs function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { SuggestOptimizedTaskInputsInputSchema, SuggestOptimizedTaskInputsOutputSchema } from '@/lib/zod-schemas';
import type { SuggestOptimizedTaskInputsInput, SuggestOptimizedTaskInputsOutput } from '@/lib/zod-schemas';


export async function suggestOptimizedTaskInputs(input: SuggestOptimizedTaskInputsInput): Promise<SuggestOptimizedTaskInputsOutput> {
  return suggestOptimizedTaskInputsFlow(input);
}

const prompt = ai.definePrompt({
    name: 'suggestOptimizedTaskInputsPrompt',
    input: { schema: SuggestOptimizedTaskInputsInputSchema },
    output: { schema: SuggestOptimizedTaskInputsOutputSchema },
    prompt: `
      You are an expert ERPsim business strategist. Your goal is to analyze a specific task and the current game state to suggest optimal input values that will help the team achieve its goals (e.g., maximize profit, maintain market share, minimize emissions).

      Analyze the provided Task and the current GameState.
      For each 'dataField' within the task, determine the optimal 'suggestedValue'.
      Provide a concise 'aiRationale' for each suggestion, explaining why it's a good decision based on the game state.

      Current Game State:
      \`\`\`json
      {{{json gameState}}}
      \`\`\`

      Task to Analyze:
      \`\`\`json
      {{{json task}}}
      \`\`\`

      Return the entire task object, but with the 'dataFields' array updated with your new 'suggestedValue' and 'aiRationale' for each field. Do not change any other properties of the task.
      If the task has no dataFields, return it unchanged.
    `,
});

const suggestOptimizedTaskInputsFlow = ai.defineFlow(
    {
        name: 'suggestOptimizedTaskInputsFlow',
        inputSchema: SuggestOptimizedTaskInputsInputSchema,
        outputSchema: SuggestOptimizedTaskInputsOutputSchema,
    },
    async (input) => {
        // If there are no data fields, there's nothing to optimize. Return the original task.
        if (!input.task.dataFields || input.task.dataFields.length === 0) {
            return SuggestOptimizedTaskInputsOutputSchema.parse({ updatedTask: input.task });
        }

        const { output } = await prompt(input);
        if (!output) {
            throw new Error('The AI model did not return a valid output.');
        }

        // The model should return the full task object.
        // We ensure the top-level properties of the original task are preserved.
        const finalTask = {
            ...input.task,
            ...output.updatedTask,
            dataFields: output.updatedTask.dataFields || input.task.dataFields,
        };

        return SuggestOptimizedTaskInputsOutputSchema.parse({ updatedTask: finalTask });
    }
);
