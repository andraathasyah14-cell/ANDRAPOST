
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import { saveFeedback, type SaveFeedbackInput } from '@/ai/flows/save-feedback';
import { categorizeContent, CategorizeContentInput } from '@/ai/flows/categorize-content';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// --- FIREBASE ADMIN INITIALIZATION (SERVER-SIDE) ---
if (!getApps().length) {
    try {
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) : undefined;
        initializeApp({
            credential: serviceAccount ? cert(serviceAccount) : undefined,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
        console.log("Firebase Admin SDK initialized on the server.");
    } catch (e) {
        console.error('Firebase Admin initialization error:', e);
    }
}
const adminAuth = getAdminAuth();
export const adminDb = getFirestore();
export const adminStorage = getStorage();


// --- AUTH ACTIONS ---

export async function verifySession() {
  const sessionCookie = cookies().get('__session')?.value;
  if (!sessionCookie) {
    return { isLoggedIn: false, user: null };
  }
  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    return { isLoggedIn: true, user: decodedClaims };
  } catch (error) {
    return { isLoggedIn: false, user: null };
  }
}


const sessionCookieSchema = z.object({
  idToken: z.string().min(1, "ID token tidak boleh kosong."),
});

export async function createSession(prevState: any, formData: FormData) {
  const validatedFields = sessionCookieSchema.safeParse({
    idToken: formData.get('idToken'),
  });

  if (!validatedFields.success) {
    return { success: false, message: 'ID Token tidak valid.' };
  }
  
  const { idToken } = validatedFields.data;
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 hari

  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    cookies().set('__session', sessionCookie, { maxAge: expiresIn, httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    return { success: true, message: 'Sesi berhasil dibuat.' };
  } catch (error) {
    console.error("Error creating session cookie:", error);
    return { success: false, message: 'Gagal membuat sesi cookie di server.' };
  }
}

export async function handleLogout() {
    cookies().delete('__session');
    revalidatePath('/', 'layout');
}


// --- FEEDBACK ACTION ---
const feedbackSchema = z.object({
    name: z.string().min(1, 'Nama wajib diisi.'),
    email: z.string().email('Format email tidak valid.'),
    message: z.string().min(10, 'Pesan harus berisi minimal 10 karakter.'),
});

export async function handleFeedbackSubmit(prevState: any, formData: FormData) {
    const validatedFields = feedbackSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Validasi gagal. Periksa kembali isian Anda.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        await saveFeedback(validatedFields.data as SaveFeedbackInput);
        return {
            success: true,
            message: "Terima kasih! Kritik & saran Anda telah berhasil dikirimkan.",
            errors: null,
        };
    } catch (error) {
        console.error("Error submitting feedback:", error);
        return {
            success: false,
            message: "Terjadi kesalahan pada server. Silakan coba lagi nanti.",
            errors: null,
        };
    }
}


// --- CONTENT CATEGORIZATION ACTION ---
const categorizeSchema = z.object({
    title: z.string().min(1, 'Judul wajib diisi.'),
    body: z.string().min(1, 'Isi konten wajib diisi.'),
});

export async function handleCategorize(prevState: any, formData: FormData) {
    const validatedFields = categorizeSchema.safeParse({
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
        const input: CategorizeContentInput = {
            contentTitle: validatedFields.data.title,
            contentBody: validatedFields.data.body,
        };
        const result = await categorizeContent(input);
        return {
            suggestedTags: result.suggestedTags,
            error: null,
        };
    } catch (error) {
        console.error('Error categorizing content:', error);
        return {
            suggestedTags: [],
            error: { _form: 'Gagal menganalisis konten. Silakan coba lagi.' },
        };
    }
}

// --- CONTENT MANAGEMENT ACTIONS ---

const contentSchemaBase = z.object({
    title: z.string().min(3, "Judul minimal 3 karakter."),
    tags: z.array(z.string()).min(1, "Pilih minimal satu tag."),
    imageUrl: z.string().url("URL gambar tidak valid.").min(1, "Gambar wajib diunggah."),
    author: z.string().min(1),
});

const opinionSchema = contentSchemaBase.extend({
    postedOn: z.string().min(1, "Tanggal wajib diisi."),
    content: z.string().min(10, "Isi minimal 10 karakter."),
});

const publicationSchema = contentSchemaBase.extend({
    publishedOn: z.string().min(1, "Tanggal publikasi wajib diisi."),
    description: z.string().min(10, "Deskripsi minimal 10 karakter."),
    fileUrl: z.string().url("URL file tidak valid.").min(1, "File PDF wajib diunggah."),
    status: z.enum(['public', 'private']),
});

const ongoingSchema = contentSchemaBase.extend({
    startedOn: z.string().min(1, "Tanggal mulai wajib diisi."),
    description: z.string().min(10, "Deskripsi minimal 10 karakter."),
});


async function addContent(collectionName: 'opinions' | 'publications' | 'ongoing', data: any) {
    const { user } = await verifySession();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const payload: any = { 
        ...data,
        author: user.name || user.email, // Use name if available, else email
        createdAt: new Date().toISOString(),
    };

    if (collectionName === 'ongoing') {
      payload.startedOn = new Date(data.startedOn);
    }
    
    await adminDb.collection(collectionName).add(payload);
    revalidatePath('/', 'layout');
}


export async function handleOpinionUpload(prevState: any, formData: FormData) {
    const { user } = await verifySession();
    const validatedFields = opinionSchema.safeParse({
        title: formData.get('title'),
        tags: formData.getAll('tags'),
        imageUrl: formData.get('imageUrl'),
        postedOn: formData.get('postedOn'),
        content: formData.get('content'),
        author: user?.name || user?.email,
    });

    if (!validatedFields.success) {
        return { success: false, message: "Validasi gagal", errors: validatedFields.error.flatten().fieldErrors };
    }

    try {
        await addContent('opinions', validatedFields.data);
        return { success: true, message: 'Opini berhasil diunggah!' };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

export async function handlePublicationUpload(prevState: any, formData: FormData) {
     const { user } = await verifySession();
    const validatedFields = publicationSchema.safeParse({
        title: formData.get('title'),
        tags: formData.getAll('tags'),
        imageUrl: formData.get('imageUrl'),
        publishedOn: formData.get('publishedOn'),
        description: formData.get('description'),
        fileUrl: formData.get('fileUrl'),
        status: formData.get('status'),
        author: user?.name || user?.email,
    });

    if (!validatedFields.success) {
        return { success: false, message: "Validasi gagal", errors: validatedFields.error.flatten().fieldErrors };
    }
     try {
        await addContent('publications', validatedFields.data);
        return { success: true, message: 'Publikasi berhasil diunggah!' };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}


export async function handleOngoingUpload(prevState: any, formData: FormData) {
    const { user } = await verifySession();
    const validatedFields = ongoingSchema.safeParse({
        title: formData.get('title'),
        tags: formData.getAll('tags'),
        imageUrl: formData.get('imageUrl'),
        startedOn: formData.get('startedOn'),
        description: formData.get('description'),
        author: user?.name || user?.email,
    });

    if (!validatedFields.success) {
        return { success: false, message: "Validasi gagal", errors: validatedFields.error.flatten().fieldErrors };
    }
    try {
        await addContent('ongoing', validatedFields.data);
        return { success: true, message: 'Riset ongoing berhasil diunggah!' };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}


const profileSchema = z.object({
  name: z.string().min(1, "Nama tidak boleh kosong"),
  description: z.string().min(1, "Deskripsi tidak boleh kosong"),
  imageUrl: z.string().url().optional().or(z.literal('')),
  tools: z.array(z.object({
    name: z.string(),
    imageUrl: z.string()
  }))
});


export async function updateProfile(prevState: any, formData: FormData) {
  const { user } = await verifySession();
  if (!user) {
    return { success: false, message: "Akses ditolak" };
  }
  
  const tools = formData.getAll('tools').map(t => JSON.parse(t.toString()));

  const validatedFields = profileSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    imageUrl: formData.get('imageUrl'),
    tools: tools
  });
  
  if (!validatedFields.success) {
    return { success: false, message: "Validasi gagal", errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await adminDb.collection('profile').doc('main').set(validatedFields.data, { merge: true });
    revalidatePath('/', 'layout');
    return { success: true, message: "Profil berhasil diperbarui." };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, message: "Gagal memperbarui profil." };
  }
}

export async function handleDeleteContent(collectionName: string, docId: string) {
    const { user } = await verifySession();
    if (!user) {
        return { success: false, message: "Akses ditolak." };
    }
    
    try {
        const docRef = adminDb.collection(collectionName).doc(docId);
        const doc = await docRef.get();
        if (!doc.exists) {
            return { success: false, message: "Dokumen tidak ditemukan." };
        }
        const data = doc.data();

        // Hapus file dari storage jika ada
        if (data?.imageUrl) {
            try {
                const imageRef = adminStorage.bucket().file(new URL(data.imageUrl).pathname.split('/').slice(2).join('/'));
                await imageRef.delete();
            } catch (e) {
                console.warn("Gagal menghapus gambar:", e); // Jangan gagalkan proses jika file tidak ada
            }
        }
        if (data?.fileUrl) {
             try {
                const fileRef = adminStorage.bucket().file(new URL(data.fileUrl).pathname.split('/').slice(2).join('/'));
                await fileRef.delete();
            } catch (e) {
                console.warn("Gagal menghapus file:", e);
            }
        }

        // Hapus dokumen dari firestore
        await docRef.delete();

        revalidatePath('/', 'layout');
        return { success: true, message: "Konten berhasil dihapus." };

    } catch (error) {
        console.error("Error deleting content:", error);
        return { success: false, message: "Terjadi kesalahan saat menghapus konten." };
    }
}
