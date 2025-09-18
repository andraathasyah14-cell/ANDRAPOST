
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import { saveFeedback, type SaveFeedbackInput } from '@/ai/flows/save-feedback';
import { categorizeContent, CategorizeContentInput } from '@/ai/flows/categorize-content';

// --- FIREBASE ADMIN INITIALIZATION (SERVER-SIDE) ---
if (!getApps().length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) : undefined;
    initializeApp({
        credential: serviceAccount ? cert(serviceAccount) : undefined,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
    console.log("Firebase Admin SDK initialized on the server.");
}
const adminAuth = getAdminAuth();


// --- AUTH ACTIONS ---
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
