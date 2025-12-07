import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// This is the correct and robust way to initialize Genkit for Vercel.
// It directly uses the environment variable that is set in the Vercel project settings.
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
