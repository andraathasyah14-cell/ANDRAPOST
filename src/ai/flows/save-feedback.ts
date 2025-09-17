
'use server';
/**
 * @fileOverview A flow to save user feedback to Firestore.
 *
 * - saveFeedback - Saves a feedback message to the 'feedback' collection.
 * - SaveFeedbackInput - The input type for the saveFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

const SaveFeedbackInputSchema = z.object({
  name: z.string().describe('The name of the person giving feedback.'),
  email: z.string().email().describe('The email of the person.'),
  message: z.string().describe('The feedback message.'),
});

export type SaveFeedbackInput = z.infer<typeof SaveFeedbackInputSchema>;

export async function saveFeedback(input: SaveFeedbackInput): Promise<{success: boolean}> {
  return saveFeedbackFlow(input);
}

const saveFeedbackFlow = ai.defineFlow(
  {
    name: 'saveFeedbackFlow',
    inputSchema: SaveFeedbackInputSchema,
    outputSchema: z.object({success: z.boolean()}),
  },
  async input => {
    // Genkit flows run in a separate server environment and need their own initialization.
    if (!getApps().length) {
        initializeApp({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
    }
    const db = getFirestore();

    if (!db) {
      console.error("Database not initialized, can't save feedback.");
      return {success: false};
    }
    // Data dari formulir feedback disimpan di koleksi 'feedback' di Cloud Firestore.
    await db.collection('feedback').add({
      ...input,
      createdAt: new Date().toISOString(),
    });
    return {success: true};
  }
);
