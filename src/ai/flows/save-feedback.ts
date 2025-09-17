'use server';
/**
 * @fileOverview A flow to save user feedback to Firestore.
 *
 * - saveFeedback - Saves a feedback message to the 'feedback' collection.
 * - SaveFeedbackInput - The input type for the saveFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { db } from '@/lib/firebase-admin'; // Impor instance db yang sudah diinisialisasi

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
    // getFirestore() tidak lagi diperlukan, langsung gunakan `db`
    await db.collection('feedback').add({
      ...input,
      createdAt: new Date().toISOString(),
    });
    return {success: true};
  }
);
