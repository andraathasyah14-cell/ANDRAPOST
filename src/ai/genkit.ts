import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI(),
    // firebase() was removed to fix build errors.
  ],
  model: 'googleai/gemini-2.5-flash',
});
