
'use server';

/**
 * @fileOverview An AI flow for generating project ideas.
 *
 * - generateIdea - A function that creates a project idea based on a topic.
 * - IdeaInput - The input type for the generateIdea function.
 * - Idea - The output type for the generateIdea function.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';

// Initialize Genkit and the Google AI plugin
const ai = genkit({
  plugins: [
    googleAI(),
  ],
});


// Define the input schema for the idea generation flow.
const IdeaInputSchema = z.object({
  topic: z.string().describe('The topic or domain for which to generate a project idea.'),
});
export type IdeaInput = z.infer<typeof IdeaInputSchema>;

// Define the output schema for the generated idea.
const IdeaSchema = z.object({
  title: z.string().describe('A creative and descriptive title for the project.'),
  description: z.string().describe('A detailed paragraph describing the project, its features, and potential technologies.'),
});
export type Idea = z.infer<typeof IdeaSchema>;

/**
 * An exported wrapper function that calls the Genkit flow to generate a project idea.
 * @param input - The topic for the idea.
 * @returns A promise that resolves to the generated project idea.
 */
export async function generateIdea(input: IdeaInput): Promise<Idea> {
  return await ideaGeneratorFlow(input);
}

// Define the AI prompt for generating the idea.
const ideaPrompt = ai.definePrompt({
  name: 'ideaGeneratorPrompt',
  input: { schema: IdeaInputSchema },
  output: { schema: IdeaSchema },
  prompt: `
    You are an expert academic project consultant for engineering and science students.
    Your task is to generate a single, innovative, and practical project idea based on the given topic.

    The idea should be suitable for a final year project.

    Topic: {{{topic}}}

    Generate a compelling project title and a detailed description.
    The description should be a single, well-written paragraph. Explain the project's goal, key features, and suggest some technologies or components that could be used.
  `,
});

// Define the Genkit flow that orchestrates the idea generation.
const ideaGeneratorFlow = ai.defineFlow(
  {
    name: 'ideaGeneratorFlow',
    inputSchema: IdeaInputSchema,
    outputSchema: IdeaSchema,
  },
  async (input) => {
    const { output } = await ideaPrompt(input);
    if (!output) {
      throw new Error('Failed to generate an idea from the model.');
    }
    return output;
  }
);
