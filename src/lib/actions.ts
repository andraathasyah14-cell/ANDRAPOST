'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/firebase-admin';
import { categorizeContent } from '@/ai/flows/categorize-content';
import { saveFeedback } from '@/ai/flows/save-feedback';


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
  const validatedFields = profileSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    imageUrl: formData.get('imageUrl'),
    tools: formData.getAll('tools').map(t => JSON.parse(t as string)),
  });
  
  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return { success: false, message: 'Validasi data gagal. Periksa kembali semua isian.' };
  }

  try {
    await db.collection('app-data').doc('profile').update(validatedFields.data);
    revalidatePath('/');
    revalidatePath('/admin01');
    return { success: true, message: 'Profil berhasil diperbarui!' };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, message: 'Gagal memperbarui profil di database.' };
  }
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
    const validatedFields = opinionUploadSchema.safeParse({
        postedOn: formData.get('postedOn'),
        title: formData.get('title'),
        tags: formData.getAll('tags'),
        content: formData.get('content'),
        imageUrl: formData.get('imageUrl'),
    });

    if (!validatedFields.success) {
        return { success: false, message: 'Validasi gagal', errors: validatedFields.error.flatten().fieldErrors };
    }

    try {
        const { imageUrl, ...rest } = validatedFields.data;
        const newOpinion = {
            contentType: 'opinion',
            ...rest,
            image: { imageUrl },
        };
        await db.collection('content').add(newOpinion);
        revalidatePath('/');
        revalidatePath('/opini');
        revalidatePath('/admin01');
        return { success: true, message: 'Opini berhasil diunggah!', errors: null };
    } catch (error) {
        console.error('Error uploading opinion:', error);
        return { success: false, message: 'Gagal mengunggah opini.', errors: null };
    }
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
    const validatedFields = publicationUploadSchema.safeParse({
        publishedOn: formData.get('publishedOn'),
        title: formData.get('title'),
        tags: formData.getAll('tags'),
        description: formData.get('description'),
        fileUrl: formData.get('fileUrl'),
        status: formData.get('status'),
        imageUrl: formData.get('imageUrl'),
    });
    
    if (!validatedFields.success) {
        return { success: false, message: 'Validasi gagal.', errors: validatedFields.error.flatten().fieldErrors };
    }
    
    try {
        const { imageUrl, ...rest } = validatedFields.data;
        const newPublication = {
            contentType: 'publication',
            ...rest,
            image: { imageUrl },
            // In a real app, you might want to generate a viewUrl differently
            viewUrl: rest.fileUrl 
        };
        await db.collection('content').add(newPublication);
        revalidatePath('/');
        revalidatePath('/publikasi');
        revalidatePath('/admin01');
        return { success: true, message: 'Publikasi berhasil diunggah!', errors: null };
    } catch (error) {
        console.error('Error uploading publication:', error);
        return { success: false, message: 'Gagal mengunggah publikasi.', errors: null };
    }
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
    const validatedFields = ongoingUploadSchema.safeParse({
        startedOn: formData.get('startedOn'),
        title: formData.get('title'),
        tags: formData.getAll('tags'),
        description: formData.get('description'),
        imageUrl: formData.get('imageUrl'),
    });

    if (!validatedFields.success) {
        return { success: false, message: 'Validasi gagal.', errors: validatedFields.error.flatten().fieldErrors };
    }

    try {
        const { imageUrl, startedOn, ...rest } = validatedFields.data;
        const newOngoing = {
            contentType: 'ongoing',
            ...rest,
            startedOn: new Date(startedOn),
            image: { imageUrl },
        };
        await db.collection('content').add(newOngoing);
        revalidatePath('/');
        revalidatePath('/ongoing');
        revalidatePath('/admin01');
        return { success: true, message: 'Riset berhasil diunggah!', errors: null };
    } catch (error) {
        console.error('Error uploading ongoing research:', error);
        return { success: false, message: 'Gagal mengunggah riset.', errors: null };
    }
}

// --- DELETE CONTENT ACTION ---
export async function handleDeleteContent(contentId: string) {
  if (!contentId) {
    return { success: false, message: 'ID Konten tidak valid.' };
  }
  try {
    await db.collection('content').doc(contentId).delete();

    revalidatePath('/admin01');
    revalidatePath('/');
    revalidatePath('/opini');
    revalidatePath('/publikasi');
    revalidatePath('/ongoing');

    return { success: true, message: 'Konten berhasil dihapus.' };
  } catch (error) {
    console.error('Error deleting content:', error);
    return { success: false, message: 'Gagal menghapus konten dari database.' };
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
