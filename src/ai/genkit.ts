import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
// Firebase plugin is temporarily removed to resolve build errors.
// We will revisit the correct integration method once the app is stable.

export const ai = genkit({
  plugins: [
    googleAI(),
    // firebase(), // Temporarily disabled
  ],
  model: 'googleai/gemini-2.5-flash',
});
