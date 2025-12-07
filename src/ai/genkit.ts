import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  // This log is crucial for debugging in the Vercel environment.
  console.error("GEMINI_API_KEY environment variable not set. The AI assistant will not work.");
}

// This is the correct and robust way to initialize Genkit for Vercel.
// It directly uses the environment variable that is set in the Vercel project settings.
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: geminiApiKey,
    }),
  ],
});
