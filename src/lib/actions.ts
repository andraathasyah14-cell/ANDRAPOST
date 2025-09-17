// src/lib/actions.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/firebase-admin';
import { PlaceHolderImages, getImageDetailsById } from './placeholder-images';
import { categorizeContent } from '@/ai/flows/categorize-content';
import { saveFeedback } from '@/ai/flows/save-feedback';
import { getProfile } from './data';


// --- CATEGORIZE ACTION ---

const CategorizeSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  body: z.string().min(1, 'Body is required.'),
});

export async function handleCategorize(prevState: any, formData: FormData) {
  const validatedFields = CategorizeSchema.safeParse({
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
    console.error("Categorization Error:", error);
    return {
      suggestedTags: [],
      error: { _form: 'Gagal melakukan kategorisasi konten. Silakan coba lagi.' },
    };
  }
}

// --- PROFILE UPDATE ACTION ---

const toolSchema = z.object({
  name: z.string().min(1, 'Nama perkakas harus diisi'),
  icon: z.string().min(1, 'Ikon harus dipilih'),
});

const profileSchema = z.object({
    name: z.string().min(1, 'Nama harus diisi'),
    description: z.string().min(1, 'Deskripsi harus diisi'),
    tools: z.array(toolSchema),
    imageUrl: z.string().url("URL gambar tidak valid").optional().or(z.literal('')),
});


export async function updateProfile(prevState:any, formData: FormData) {
  try {
    const parsedTools = formData.getAll('tools').map(t => JSON.parse(t.toString()));
    
    const validatedFields = profileSchema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
        tools: parsedTools,
        imageUrl: formData.get('imageUrl'),
    });

    if (!validatedFields.success) {
      console.log(validatedFields.error.flatten().fieldErrors);
      return { success: false, message: 'Validasi data profil gagal.' };
    }
    
    // await db.collection('app-data').doc('profile').set(validatedFields.data, { merge: true });
    console.log("Profile update is disabled in this environment.");

    revalidatePath('/');
    revalidatePath('/admin01');
    return { success: true, message: 'Profil berhasil diperbarui!' };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, message: 'Gagal memperbarui profil.' };
  }
}

// --- OPINION UPLOAD ACTION ---

const opinionUploadSchema = z.object({
    postedOn: z.string().min(1, "Waktu harus diisi"),
    title: z.string().min(1, "Judul harus diisi"),
    tags: z.array(z.string()).min(1, "Pilih setidaknya satu tag"),
    content: z.string().min(1, "Isi tidak boleh kosong"),
    image: z.string().min(1, "Gambar harus dipilih"),
});


export async function handleOpinionUpload(prevState: any, formData: FormData) {
    console.log("Opinion upload is disabled in this environment.");
    revalidatePath('/');
    revalidatePath('/opini');
    revalidatePath('/admin01');
    return { success: true, message: 'Fungsi unggah opini dinonaktifkan sementara.', errors: null };
}

// --- PUBLICATION UPLOAD ACTION ---

const publicationUploadSchema = z.object({
    publishedOn: z.string().min(1, "Waktu harus diisi"),
    title: z.string().min(1, "Judul harus diisi"),
    tags: z.array(z.string()).min(1, "Pilih setidaknya satu tag"),
    description: z.string().min(1, "Deskripsi tidak boleh kosong"),
    fileUrl: z.string().url("URL file tidak valid").min(1, "URL File tidak boleh kosong"),
    status: z.enum(['public', 'private'], { errorMap: () => ({ message: "Status harus dipilih." }) }),
    image: z.string().min(1, "Gambar harus dipilih"),
});

export async function handlePublicationUpload(prevState: any, formData: FormData) {
    console.log("Publication upload is disabled in this environment.");
    revalidatePath('/');
    revalidatePath('/publikasi');
    revalidatePath('/admin01');
    return { success: true, message: 'Fungsi unggah publikasi dinonaktifkan sementara.', errors: null };
}

// --- ONGOING RESEARCH UPLOAD ACTION ---

const ongoingUploadSchema = z.object({
    startedOn: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Format tanggal tidak valid." }),
    title: z.string().min(1, "Judul harus diisi"),
    tags: z.array(z.string()).min(1, "Pilih setidaknya satu tag"),
    description: z.string().min(1, "Deskripsi tidak boleh kosong"),
    image: z.string().min(1, "Gambar harus dipilih"),
});

export async function handleOngoingUpload(prevState: any, formData: FormData) {
    console.log("Ongoing research upload is disabled in this environment.");
    revalidatePath('/');
    revalidatePath('/ongoing');
    revalidatePath('/admin01');
    return { success: true, message: 'Fungsi unggah riset dinonaktifkan sementara.', errors: null };
}


// --- FEEDBACK SUBMIT ACTION ---

const feedbackSchema = z.object({
  name: z.string().min(1, 'Nama harus diisi.'),
  email: z.string().email('Format email tidak valid.'),
  message: z.string().min(1, 'Pesan tidak boleh kosong.'),
});

export async function handleFeedbackSubmit(prevState: any, formData: FormData) {
  const validatedFields = feedbackSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      success: false, message: 'Validasi gagal.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await saveFeedback(validatedFields.data);
    return {
      success: true, message: 'Terima kasih! Pesan Anda telah terkirim.',
      errors: null,
    };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return {
      success: false, message: 'Gagal mengirim pesan. Silakan coba lagi nanti.',
      errors: null,
    };
  }
}
