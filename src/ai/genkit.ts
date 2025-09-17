'use server';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {firebase} from '@genkit-ai/firebase/v1';

export const ai = genkit({
  plugins: [
    googleAI(),
    firebase(),
  ],
  model: 'googleai/gemini-2.5-flash',
});
