'use server';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const erpSimGameDocumentSearch = ai.defineTool(
    {
        name: 'erpSimGameDocumentSearch',
        description: 'Search for information in the ERP Sim game documentation. Use this to answer questions about game rules, mechanics, or other details not available in the real-time data. For example, what are the Muesli sales channels?',
        inputSchema: z.object({
            query: z.string().describe('The search query to find information in the game documentation.'),
        }),
        outputSchema: z.string(),
    },
    async (input) => {
        // In a real application, you would implement a search over your documents here.
        // For this example, we'll return a hardcoded answer based on the query.
        if (input.query.toLowerCase().includes('muesli sales channels')) {
            return JSON.stringify({
                "source": "Muesli Sales Channels Documentation",
                "content": "Muesli is sold through three distribution channels (DC): DC12 (Hypermarkets), DC14 (Grocery Chains), and DC10 (Independent Grocers). Each DC has different characteristics, market size, and customer price sensitivity."
            });
        }
        return 'No relevant information found in the documentation for your query.';
    }
);
