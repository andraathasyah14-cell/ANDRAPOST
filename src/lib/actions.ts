'use server';

import { categorizeContent } from '@/ai/flows/categorize-content';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { PlaceHolderImages } from './placeholder-images';

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
      error: { _form: 'Gagal melakukan kategorisasi konten.' },
    };
  }
}

const toolSchema = z.object({
  name: z.string().min(1, 'Nama perkakas harus diisi'),
  icon: z.string().min(1, 'Ikon harus dipilih'),
});

const profileSchema = z.object({
  name: z.string().min(1, 'Nama harus diisi'),
  description: z.string().min(1, 'Deskripsi harus diisi'),
  tools: z.array(toolSchema),
});

export async function updateProfile(prevState:any, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    const toolEntries = formData.getAll('tools');

    const tools = toolEntries.map((entry: any) => {
       const tool = JSON.parse(entry);
       return {
         name: tool.name,
         icon: tool.icon
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

    return { success: true, message: 'Profil berhasil diperbarui!' };

  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, message: 'Gagal memperbarui profil.' };
  }
}


const opinionSchema = z.object({
    postedOn: z.string().min(1, "Waktu harus diisi"),
    author: z.string().min(1, "Nama penulis harus diisi"),
    title: z.string().min(1, "Judul harus diisi"),
    tags: z.array(z.string()).min(1, "Pilih setidaknya satu tag"),
    content: z.string().min(1, "Isi tidak boleh kosong"),
    image: z.string().min(1, "Gambar harus diisi"),
});


export async function handleOpinionUpload(prevState: any, formData: FormData) {
    const validatedFields = opinionSchema.safeParse({
        postedOn: formData.get('postedOn'),
        author: formData.get('author'),
        title: formData.get('title'),
        tags: formData.getAll('tags'),
        content: formData.get('content'),
        image: formData.get('image'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            message: 'Validation failed',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    try {
        const opinionsPath = path.join(process.cwd(), 'src', 'content', 'opinions.json');
        const opinionsJson = await fs.readFile(opinionsPath, 'utf-8');
        const opinions = JSON.parse(opinionsJson);

        const newId = `opini${String(opinions.length + 1).padStart(2, '0')}`;
        
        // Check if image id exists in placeholder images
        const imageExists = PlaceHolderImages.some(img => img.id === validatedFields.data.image);
        if (!imageExists) {
            return {
                success: false,
                message: "Image ID not found.",
                errors: { image: ['Please provide a valid Image ID from the available list.'] }
            };
        }

        const newOpinion = {
            id: newId,
            ...validatedFields.data,
        };

        opinions.push(newOpinion);

        await fs.writeFile(opinionsPath, JSON.stringify(opinions, null, 2));

        revalidatePath('/');
        revalidatePath('/opini');
        revalidatePath('/admin01');
        
        return { success: true, message: 'Opini berhasil ditambahkan!', errors: null };

    } catch (error) {
        console.error('Error uploading opinion:', error);
        return { success: false, message: 'Gagal menambahkan opini.', errors: null };
    }
}
