'use server';

/**
 * @fileOverview A Genkit flow for generating project ideas based on a topic.
 *
 * - generateProjectIdea - A function that handles the project idea generation process.
 * - GenerateProjectIdeaInput - The input type for the generateProjectIdea function.
 * - GenerateProjectIdeaOutput - The return type for the generateProjectIdea function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProjectIdeaInputSchema = z.object({
  topic: z.string().describe('The topic to generate a project idea for.'),
});
export type GenerateProjectIdeaInput = z.infer<
  typeof GenerateProjectIdeaInputSchema
>;

const GenerateProjectIdeaOutputSchema = z.object({
  idea: z.string().describe('A project idea based on the topic.'),
});
export type GenerateProjectIdeaOutput = z.infer<
  typeof GenerateProjectIdeaOutputSchema
>;

export async function generateProjectIdea(
  input: GenerateProjectIdeaInput
): Promise<GenerateProjectIdeaOutput> {
  return generateProjectIdeaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProjectIdeaPrompt',
  input: {schema: GenerateProjectIdeaInputSchema},
  output: {schema: GenerateProjectIdeaOutputSchema},
  prompt: `You are an AI assistant for an engineering solutions company called CampusBuild. You specialize in generating innovative project ideas for students and researchers.

  Topic: {{{topic}}}
  
  Based on the topic, generate a single, creative, and feasible project idea. Be encouraging and concise. Start your response with something like "That's a great topic! Here's an idea:" or a similar friendly opening.`,
});

const generateProjectIdeaFlow = ai.defineFlow(
  {
    name: 'generateProjectIdeaFlow',
    inputSchema: GenerateProjectIdeaInputSchema,
    outputSchema: GenerateProjectIdeaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model did not return a valid output.');
    }
    return output;
  }
);
