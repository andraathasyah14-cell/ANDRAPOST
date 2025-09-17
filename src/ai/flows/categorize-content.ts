'use server';

/**
 * @fileOverview AI-powered content categorization flow.
 *
 * - categorizeContent - A function that suggests relevant tags for content during the upload process.
 * - CategorizeContentInput - The input type for the categorizeContent function.
 * - CategorizeContentOutput - The return type for the categorizeContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeContentInputSchema = z.object({
  contentTitle: z.string().describe('The title of the content.'),
  contentBody: z.string().describe('The main body of the content.'),
});

export type CategorizeContentInput = z.infer<typeof CategorizeContentInputSchema>;

const CategorizeContentOutputSchema = z.object({
  suggestedTags: z
    .array(z.string())
    .describe(
      'An array of suggested tags for the content (Repost, Original, Technology, Government, International, Domestic, Quantitative, Qualitative).'
    ),
});

export type CategorizeContentOutput = z.infer<typeof CategorizeContentOutputSchema>;

export async function categorizeContent(input: CategorizeContentInput): Promise<CategorizeContentOutput> {
  return categorizeContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeContentPrompt',
  input: {schema: CategorizeContentInputSchema},
  output: {schema: CategorizeContentOutputSchema},
  prompt: `You are an expert content categorizer. Given the title and body of a content, you will suggest relevant tags from the following list: Repost, Original, Technology, Government, International, Domestic, Quantitative, Qualitative.

Title: {{{contentTitle}}}
Body: {{{contentBody}}}

Please provide the suggested tags as a JSON array of strings.
`,
});

const categorizeContentFlow = ai.defineFlow(
  {
    name: 'categorizeContentFlow',
    inputSchema: CategorizeContentInputSchema,
    outputSchema: CategorizeContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
