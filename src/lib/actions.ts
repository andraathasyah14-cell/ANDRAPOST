
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { categorizeContent } from '@/ai/flows/categorize-content';
import { saveFeedback } from '@/ai/flows/save-feedback';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';


// --- FIREBASE ADMIN INITIALIZATION (SERVER-SIDE) ---
if (!getApps().length) {
  initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
  console.log("Firebase Admin SDK initialized on the server.");
}
const db = getFirestore();
const adminAuth = getAdminAuth();


// --- AUTH HELPER ---
async function verifySessionCookie() {
  const sessionCookie = cookies().get('__session')?.value;
  if (!sessionCookie) {
    throw new Error('Unauthorized: No session cookie found.');
  }
  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    throw new Error('Unauthorized: Invalid session cookie.');
  }
}


// --- LOGIN ACTION ---
const loginSchema = z.object({
  idToken: z.string().min(1, "ID token is required."),
});

export async function createSession(prevState: any, formData: FormData) {
    const validatedFields = loginSchema.safeParse({
        idToken: formData.get('idToken'),
    });

    if (!validatedFields.success) {
        return { success: false, message: 'ID Token is missing.' };
    }

    const { idToken } = validatedFields.data;

    // Set session expiration to 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    try {
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
        cookies().set('__session', sessionCookie, { maxAge: expiresIn, httpOnly: true, secure: true });
        return { success: true, message: 'Session created successfully.' };
    } catch (error) {
        console.error("Error creating session:", error);
        return { success: false, message: 'Failed to create session.' };
    }
}

export async function clearSession() {
    cookies().delete('__session');
    return { success: true, message: 'Session cleared.' };
}


// --- CATEGORIZE ACTION ---

const CategorizeSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  body: z.string().min(1, 'Body is required.'),
});

export async function handleCategorize(prevState: any, formData: FormData) {
  await verifySessionCookie(); 
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
  const decodedClaims = await verifySessionCookie();
  
  const validatedFields = profileSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    imageUrl: formData.get('imageUrl'),
    tools: formData.getAll('tools').map(t => JSON.parse(t as string)),
  });
  
  if (!validatedFields.success) {
    return { success: false, message: 'Validasi data gagal. Periksa kembali semua isian.' };
  }

  try {
    const { name, description, imageUrl, tools } = validatedFields.data;
    
    await db.collection('profile').doc('main').set({
      name,
      description,
      imageUrl: imageUrl || null,
      tools: tools.map(tool => ({ name: tool.name, imageUrl: tool.imageUrl })),
    }, { merge: true });

    revalidatePath('/');
    revalidatePath('/admin01');
    return { success: true, message: 'Profil berhasil diperbarui!' };
  } catch (error) {
    console.error('Error updating profile in Firestore:', error);
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
    const decodedClaims = await verifySessionCookie();
   
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
        const { title, tags, content, imageUrl, postedOn } = validatedFields.data;
        
        await db.collection('opinions').add({
          title,
          tags,
          content,
          imageUrl,
          postedOn,
          author: decodedClaims.name || decodedClaims.email,
          createdAt: new Date().toISOString(),
        });

        revalidatePath('/');
        revalidatePath('/opini');
        revalidatePath('/admin01');
        return { success: true, message: 'Opini berhasil diunggah!', errors: null };
    } catch (error) {
        console.error('Error uploading opinion to Firestore:', error);
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
    const decodedClaims = await verifySessionCookie();
    
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
        const { title, tags, description, fileUrl, status, imageUrl, publishedOn } = validatedFields.data;
        
        await db.collection('publications').add({
          title,
          tags,
          description,
          fileUrl,
          status,
          imageUrl,
          publishedOn,
          author: decodedClaims.name || decodedClaims.email,
          createdAt: new Date().toISOString(),
        });

        revalidatePath('/');
        revalidatePath('/publikasi');
        revalidatePath('/admin01');
        return { success: true, message: 'Publikasi berhasil diunggah!', errors: null };
    } catch (error) {
        console.error('Error uploading publication to Firestore:', error);
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
    const decodedClaims = await verifySessionCookie();
   
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
        const { title, tags, description, imageUrl, startedOn } = validatedFields.data;

        await db.collection('ongoing').add({
          title,
          tags,
          description,
          imageUrl,
          startedOn: new Date(startedOn),
          author: decodedClaims.name || decodedClaims.email,
          createdAt: new Date().toISOString(),
        });

        revalidatePath('/');
        revalidatePath('/ongoing');
        revalidatePath('/admin01');
        return { success: true, message: 'Riset berhasil diunggah!', errors: null };
    } catch (error) {
        console.error('Error uploading ongoing research to Firestore:', error);
        return { success: false, message: 'Gagal mengunggah riset.', errors: null };
    }
}

// --- DELETE CONTENT ACTION ---
export async function handleDeleteContent(collection: string, contentId: string) {
  await verifySessionCookie();
  
  if (!contentId || typeof contentId !== 'string' || !['opinions', 'publications', 'ongoing'].includes(collection)) {
    return { success: false, message: 'ID atau Koleksi Konten tidak valid.' };
  }
  try {
    // TODO: Also delete associated image from Storage
    await db.collection(collection).doc(contentId).delete();

    revalidatePath('/admin01');
    revalidatePath('/');
    revalidatePath(`/${collection === 'opinions' ? 'opini' : collection === 'publications' ? 'publikasi' : 'ongoing'}`);

    return { success: true, message: 'Konten berhasil dihapus.' };
  } catch (error) {
    console.error(`Error deleting content from ${collection}:`, error);
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
    const {success} = await saveFeedback(validatedFields.data);
    if (!success) {
        return {
          success: false, message: 'Gagal mengirim pesan karena masalah server. Silakan coba lagi nanti.',
          errors: null,
        };
    }
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
