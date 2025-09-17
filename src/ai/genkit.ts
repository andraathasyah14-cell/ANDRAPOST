import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {googleCloud} from '@genkit-ai/google-cloud';

export const ai = genkit({
  plugins: [
    googleAI(),
    // firebase(), // Temporarily disabled to resolve build errors
    googleCloud,
  ],
  model: 'googleai/gemini-2.5-flash',
});
