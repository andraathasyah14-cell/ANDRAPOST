import {genkit, Genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// We use a global variable to cache the initialized Genkit instance.
// This is a common pattern in serverless environments to reuse connections.
declare global {
  // eslint-disable-next-line no-var
  var __genkit_sdk: Genkit | undefined;
}

function initializeGenkit(): Genkit {
  // In a development environment, we reuse the existing Genkit instance to avoid
  // re-initialization on hot-reloads, which can cause memory leaks and warnings.
  if (process.env.NODE_ENV !== 'production') {
    if (global.__genkit_sdk) {
      return global.__genkit_sdk;
    }
  }

  const genkitSDK = genkit({
    plugins: [
      googleAI(),
    ],
    model: 'googleai/gemini-2.5-flash',
  });

  if (process.env.NODE_ENV !== 'production') {
    global.__genkit_sdk = genkitSDK;
  }
  
  return genkitSDK;
}

export const ai = initializeGenkit();
