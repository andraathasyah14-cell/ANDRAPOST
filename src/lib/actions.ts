'use server';

import { categorizeContent } from '@/ai/flows/categorize-content';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

const FormSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  body: z.string().min(1, 'Body is required.'),
});

export async function handleCategorize(prevState: any, formData: FormData) {
  const validatedFields = FormSchema.safeParse({
    title: formData.get('title'),
    body: formData.get('body'),
  });

  if (!validatedFields.success) {
    return {
      suggestedTags: [],
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await categorizeContent({
      contentTitle: validatedFields.data.title,
      contentBody: validatedFields.data.body,
    });
    return { suggestedTags: result.suggestedTags, error: null };
  } catch (error) {
    console.error(error);
    return {
      suggestedTags: [],
      error: { _form: 'Failed to categorize content.' },
    };
  }
}

const toolSchema = z.object({
  name: z.string().min(1, 'Tool name is required'),
  icon: z.string().min(1, 'Icon name is required'),
});

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  tools: z.array(toolSchema),
});

export async function updateProfile(prevState:any, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    const toolEntries = formData.getAll('tools');

    const tools = toolEntries.map((entry: any) => {
       const tool = JSON.parse(entry);
       // For now, we only save the name and icon reference.
       // The actual icon components are in tool-logos.tsx
       // and the file upload logic would need a more complex backend.
       return {
         name: tool.name,
         icon: tool.icon // This assumes the icon field holds a string identifier like "MySQL"
       };
    });


    // --- Update profile.json ---
    const profilePath = path.join(process.cwd(), 'src', 'content', 'profile.json');
    const profileData = { name, description };
    await fs.writeFile(profilePath, JSON.stringify(profileData, null, 2));

    // --- Update tools.json ---
    const toolsPath = path.join(process.cwd(), 'src', 'content', 'tools.json');
    await fs.writeFile(toolsPath, JSON.stringify(tools, null, 2));

    // Revalidate the home page to show the new data
    revalidatePath('/');
    revalidatePath('/admin01');

    return { success: true, message: 'Profile updated successfully!' };

  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, message: 'Failed to update profile.' };
  }
}
