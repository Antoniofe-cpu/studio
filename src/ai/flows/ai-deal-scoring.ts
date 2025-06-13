'use server';

/**
 * @fileOverview AI deal scoring flow.
 *
 * - aiDealScoring - A function that provides an AI-driven score (0-100) for each watch listing
 * - AiDealScoringInput - The input type for the aiDealScoring function.
 * - AiDealScoringOutput - The return type for the aiDealScoring function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiDealScoringInputSchema = z.object({
  margin: z.number().describe('The margin percentage of the watch listing.'),
  demand: z.string().describe('The current demand for the watch model.'),
  rarity: z.string().describe('The rarity of the watch model.'),
  condition: z.string().describe('The condition of the watch.'),
  risk: z.string().describe('The risk associated with purchasing this watch.'),
});
export type AiDealScoringInput = z.infer<typeof AiDealScoringInputSchema>;

const AiDealScoringOutputSchema = z.object({
  aiScore: z
    .number()
    .describe('The AI score (0-100) for the watch listing.')
    .min(0)
    .max(100),
  reasoning: z.string().describe('The reasoning behind the AI score.'),
});
export type AiDealScoringOutput = z.infer<typeof AiDealScoringOutputSchema>;

export async function aiDealScoring(input: AiDealScoringInput): Promise<AiDealScoringOutput> {
  return aiDealScoringFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiDealScoringPrompt',
  input: {schema: AiDealScoringInputSchema},
  output: {schema: AiDealScoringOutputSchema},
  prompt: `You are an AI expert in luxury watches, tasked with providing a deal score between 0 and 100.

  Based on the following factors, assign an AI score to the watch listing and explain your reasoning.

  Margin: {{margin}}%
  Demand: {{demand}}
Rarity: {{rarity}}
Condition: {{condition}}
Risk: {{risk}}

  Provide the AI score and a short explanation of your reasoning for the score.
`,
});

const aiDealScoringFlow = ai.defineFlow(
  {
    name: 'aiDealScoringFlow',
    inputSchema: AiDealScoringInputSchema,
    outputSchema: AiDealScoringOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
