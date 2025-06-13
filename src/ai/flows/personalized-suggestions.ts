'use server';

/**
 * @fileOverview An AI agent that provides personalized watch suggestions based on user preferences and history.
 *
 * - getPersonalizedSuggestions - A function that generates personalized watch suggestions.
 * - PersonalizedSuggestionsInput - The input type for the getPersonalizedSuggestions function.
 * - PersonalizedSuggestionsOutput - The return type for the getPersonalizedSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedSuggestionsInputSchema = z.object({
  userHistory: z
    .string()
    .describe('The user history, including previously viewed watches, purchases, and interactions.'),
  userPreferences: z
    .string()
    .describe('The user preferences, such as preferred brands, price ranges, and styles.'),
  currentTrends: z.string().describe('The current trends in the watch market.'),
});
export type PersonalizedSuggestionsInput = z.infer<typeof PersonalizedSuggestionsInputSchema>;

const PersonalizedSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of personalized watch suggestions based on user data and market trends.'),
});
export type PersonalizedSuggestionsOutput = z.infer<typeof PersonalizedSuggestionsOutputSchema>;

export async function getPersonalizedSuggestions(
  input: PersonalizedSuggestionsInput
): Promise<PersonalizedSuggestionsOutput> {
  return personalizedSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedSuggestionsPrompt',
  input: {schema: PersonalizedSuggestionsInputSchema},
  output: {schema: PersonalizedSuggestionsOutputSchema},
  prompt: `You are an expert watch consultant. Based on the user's history, preferences, and current market trends, provide personalized watch suggestions.

User History: {{{userHistory}}}
User Preferences: {{{userPreferences}}}
Current Trends: {{{currentTrends}}}

Suggestions:`,
});

const personalizedSuggestionsFlow = ai.defineFlow(
  {
    name: 'personalizedSuggestionsFlow',
    inputSchema: PersonalizedSuggestionsInputSchema,
    outputSchema: PersonalizedSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
