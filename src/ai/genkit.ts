import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {firebase as firebasePlugin} from '@genkit-ai/firebase/v1';
import {googleCloud} from '@genkit-ai/google-cloud';

export const ai = genkit({
  plugins: [
    googleAI(),
    firebasePlugin(),
    googleCloud({
      projectId: process.env.FIREBASE_PROJECT_ID,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
