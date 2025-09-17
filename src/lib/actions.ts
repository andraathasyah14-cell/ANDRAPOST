
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
  imageUrl: z.string().min(1, 'Logo harus diunggah'),
});

const profileSchema = z.object({
    name: z.string().min(1, 'Nama harus diisi'),
    description: z.string().min(1, 'Deskripsi harus diisi'),
    tools: z.array(toolSchema),
    imageUrl: z.string().url("URL gambar tidak valid").optional().or(z.literal('')),
});


export async function updateProfile(prevState:any, formData: FormData) {
  // Database functionality is temporarily disabled.
  console.log("Profile update is disabled in this environment.");
  revalidatePath('/');
  revalidatePath('/admin01');
  return { success: true, message: 'Fungsi pembaruan profil dinonaktifkan sementara.' };
}

// --- OPINION UPLOAD ACTION ---

const opinionUploadSchema = z.object({
    postedOn: z.string().min(1, "Waktu harus diisi"),
    title: z.string().min(1, "Judul harus diisi"),
    tags: z.array(z.string()).min(1, "Pilih setidaknya satu tag"),
    content: z.string().min(1, "Isi tidak boleh kosong"),
    imageUrl: z.string().url("URL Gambar tidak valid.").min(1, "Gambar harus diunggah."),
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
    imageUrl: z.string().url("URL Gambar tidak valid.").min(1, "Gambar harus diunggah."),
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
    imageUrl: z.string().url("URL Gambar tidak valid.").min(1, "Gambar harus diunggah."),
});

export async function handleOngoingUpload(prevState: any, formData: FormData) {
    console.log("Ongoing research upload is disabled in this environment.");
    revalidatePath('/');
    revalidatePath('/ongoing');
    revalidatePath('/admin01');
    return { success: true, message: 'Fungsi unggah riset dinonaktifkan sementara.', errors: null };
}

// --- DELETE CONTENT ACTION ---
export async function handleDeleteContent(contentId: string) {
  try {
    // This is a placeholder. In a real app, you'd delete from the database.
    console.log(`(DEMO) Deleting content with ID: ${contentId}. Database is disabled.`);
    
    // In a real scenario with Firestore:
    // await db.collection('content').doc(contentId).delete();

    revalidatePath('/admin01'); // Revalidate the admin page to show updated list
    revalidatePath('/'); // Revalidate home page
    revalidatePath('/opini');
    revalidatePath('/publikasi');
    revalidatePath('/ongoing');

    return { success: true, message: 'Konten berhasil dihapus (secara demo).' };
  } catch (error) {
    console.error('Error deleting content:', error);
    return { success: false, message: 'Gagal menghapus konten.' };
  }
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
