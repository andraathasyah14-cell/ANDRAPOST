'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from '@/lib/firebase-admin'; // Impor instance db yang sudah diinisialisasi
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
});


export async function updateProfile(prevState:any, formData: FormData) {
  try {
    const toolEntries = formData.getAll('tools');
    const tools = toolEntries.map((entry: any) => JSON.parse(entry));
    
    const validatedFields = profileSchema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
        tools: tools,
    });

    if (!validatedFields.success) {
        return { success: false, message: 'Data tidak valid. Periksa kembali semua isian.' };
    }
    
    const profileRef = db.collection('profile').doc('user_profile');
    await profileRef.set(validatedFields.data, { merge: true });

    // Revalidate all relevant paths
    revalidatePath('/');
    revalidatePath('/admin01');
    revalidatePath('/opini');
    revalidatePath('/publikasi');
    revalidatePath('/ongoing');


    return { success: true, message: 'Profil berhasil diperbarui!' };

  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, message: 'Gagal memperbarui profil. Terjadi kesalahan server.' };
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
    const validatedFields = opinionUploadSchema.safeParse({
        postedOn: formData.get('postedOn'),
        title: formData.get('title'),
        tags: formData.getAll('tags'),
        content: formData.get('content'),
        image: formData.get('image'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            message: 'Validasi gagal. Periksa kembali semua isian.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    try {
        const imageDetails = getImageDetailsById(validatedFields.data.image);
        if (!imageDetails) {
            return {
                success: false, message: "ID Gambar tidak valid.",
                errors: { image: ['Pilih gambar yang valid dari daftar.'] }
            };
        }

        const newOpinion = {
            contentType: 'opinion',
            ...validatedFields.data,
            image: imageDetails,
        };
        
        await db.collection('content').add(newOpinion);

        revalidatePath('/');
        revalidatePath('/opini');
        revalidatePath('/admin01');
        
        return { success: true, message: 'Opini berhasil ditambahkan!', errors: null };

    } catch (error) {
        console.error('Error uploading opinion:', error);
        return { success: false, message: 'Gagal menambahkan opini karena kesalahan server.', errors: null };
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
    image: z.string().min(1, "Gambar harus dipilih"),
});

export async function handlePublicationUpload(prevState: any, formData: FormData) {
    const validatedFields = publicationUploadSchema.safeParse({
        publishedOn: formData.get('publishedOn'),
        title: formData.get('title'),
        tags: formData.getAll('tags'),
        description: formData.get('description'),
        fileUrl: formData.get('fileUrl'),
        status: formData.get('status'),
        image: formData.get('image'),
    });

    if (!validatedFields.success) {
        return {
            success: false, message: 'Validasi gagal. Periksa kembali semua isian.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    try {
        const imageDetails = getImageDetailsById(validatedFields.data.image);
        if (!imageDetails) {
            return {
                success: false, message: "ID Gambar tidak valid.",
                errors: { image: ['Pilih gambar yang valid dari daftar.'] }
            };
        }

        const newPublication = { 
            contentType: 'publication',
            ...validatedFields.data, 
            image: imageDetails,
            viewUrl: "#" 
        };
        
        await db.collection('content').add(newPublication);

        revalidatePath('/');
        revalidatePath('/publikasi');
        revalidatePath('/admin01');
        
        return { success: true, message: 'Publikasi berhasil ditambahkan!', errors: null };

    } catch (error) {
        console.error('Error uploading publication:', error);
        return { success: false, message: 'Gagal menambahkan publikasi karena kesalahan server.', errors: null };
    }
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
    const validatedFields = ongoingUploadSchema.safeParse({
        startedOn: formData.get('startedOn'),
        title: formData.get('title'),
        tags: formData.getAll('tags'),
        description: formData.get('description'),
        image: formData.get('image'),
    });

    if (!validatedFields.success) {
        return {
            success: false, message: 'Validasi gagal. Periksa kembali semua isian.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    try {
        const imageDetails = getImageDetailsById(validatedFields.data.image);
        if (!imageDetails) {
             return {
                success: false, message: "ID Gambar tidak valid.",
                errors: { image: ['Pilih gambar yang valid dari daftar.'] }
            };
        }
        
        const newOngoing = {
            contentType: 'ongoing',
            ...validatedFields.data,
            image: imageDetails,
            startedOn: Timestamp.fromDate(new Date(validatedFields.data.startedOn)),
        };

        await db.collection('content').add(newOngoing);

        revalidatePath('/');
        revalidatePath('/ongoing');
        revalidatePath('/admin01');
        
        return { success: true, message: 'Riset ongoing berhasil ditambahkan!', errors: null };

    } catch (error) {
        console.error('Error uploading ongoing research:', error);
        return { success: false, message: 'Gagal menambahkan riset karena kesalahan server.', errors: null };
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
