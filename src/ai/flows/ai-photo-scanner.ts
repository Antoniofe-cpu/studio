// src/ai/flows/ai-photo-scanner.ts
'use server';

/**
 * @fileOverview An AI agent that identifies a watch model and estimates its current value from a photo.
 *
 * - aiPhotoScanner - A function that handles the watch identification and valuation process.
 * - AiPhotoScannerInput - The input type for the aiPhotoScanner function.
 * - AiPhotoScannerOutput - The return type for the aiPhotoScanner function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPhotoScannerInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a watch, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AiPhotoScannerInput = z.infer<typeof AiPhotoScannerInputSchema>;

const AiPhotoScannerOutputSchema = z.object({
  identification: z.object({
    modelName: z.string().describe('The name of the identified watch model.'),
    estimatedValue: z
      .string()
      .describe('The estimated current value of the watch.'),
  }),
});
export type AiPhotoScannerOutput = z.infer<typeof AiPhotoScannerOutputSchema>;

export async function aiPhotoScanner(input: AiPhotoScannerInput): Promise<AiPhotoScannerOutput> {
  return aiPhotoScannerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPhotoScannerPrompt',
  input: {schema: AiPhotoScannerInputSchema},
  output: {schema: AiPhotoScannerOutputSchema},
  prompt: `You are an expert in luxury watches. You can identify a watch model and estimate its current value based on a photo.

  Analyze the following photo and provide the watch model name and its estimated current value. Be as accurate as possible.

  Photo: {{media url=photoDataUri}}`,
});

const aiPhotoScannerFlow = ai.defineFlow(
  {
    name: 'aiPhotoScannerFlow',
    inputSchema: AiPhotoScannerInputSchema,
    outputSchema: AiPhotoScannerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
