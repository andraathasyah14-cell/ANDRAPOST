
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/mysql'; // Switch to MySQL
import type { ResultSetHeader } from 'mysql2';
import { admin } from '@/lib/firebase-admin'; // Keep for signed URL generation and auth
import { categorizeContent } from '@/ai/flows/categorize-content';
import { saveFeedback } from '@/ai/flows/save-feedback';
import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';

// --- AUTH HELPER ---
async function verifyAuth() {
  const sessionCookie = cookies().get('__session')?.value;
  if (!sessionCookie) {
    throw new Error('Unauthorized');
  }
  if (!admin) {
    throw new Error('Firebase Admin not initialized');
  }
  try {
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    throw new Error('Unauthorized');
  }
}


// --- GET SIGNED UPLOAD URL ACTION (Remains the same, uses Firebase Storage) ---
const getSignedUrlSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1),
});

export async function getSignedUploadUrl(prevState: any, formData: FormData) {
  await verifyAuth(); // Secure this action
  if (!admin) {
    return { success: false, message: 'Firebase Admin is not initialized. Cannot get signed URL.' };
  }
  const validatedFields = getSignedUrlSchema.safeParse({
    fileName: formData.get('fileName'),
    fileType: formData.get('fileType'),
  });

  if (!validatedFields.success) {
    return { success: false, message: 'Invalid file data provided.' };
  }

  const { fileName, fileType } = validatedFields.data;
  const filePath = `uploads/${randomUUID()}-${fileName}`;

  try {
    const bucket = admin.storage().bucket();
    const file = bucket.file(filePath);
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires,
      contentType: fileType,
    });
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    return { success: true, signedUrl, publicUrl };
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return { success: false, message: 'Failed to get a signed URL from the server.' };
  }
}


// --- CATEGORIZE ACTION (Remains the same, it's an AI flow) ---

const CategorizeSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  body: z.string().min(1, 'Body is required.'),
});

export async function handleCategorize(prevState: any, formData: FormData) {
  await verifyAuth(); // Secure this action
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

// --- PROFILE UPDATE ACTION (Migrated to MySQL) ---

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
  await verifyAuth(); // Secure this action
  if (!db) {
    return { success: false, message: 'Database tidak tersedia. Gagal memperbarui profil.' };
  }
  const validatedFields = profileSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    imageUrl: formData.get('imageUrl'),
    tools: formData.getAll('tools').map(t => JSON.parse(t as string)),
  });
  
  if (!validatedFields.success) {
    return { success: false, message: 'Validasi data gagal. Periksa kembali semua isian.' };
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { name, description, imageUrl, tools } = validatedFields.data;
    
    // Update profile table
    await connection.query(
      'UPDATE profile SET name = ?, description = ?, image_url = ? WHERE id = 1',
      [name, description, imageUrl || null]
    );

    // Replace tools
    await connection.query('DELETE FROM tools');
    for (const tool of tools) {
        await connection.query('INSERT INTO tools (name, image_url) VALUES (?, ?)', [tool.name, tool.imageUrl]);
    }

    await connection.commit();
    revalidatePath('/');
    revalidatePath('/admin01');
    return { success: true, message: 'Profil berhasil diperbarui!' };
  } catch (error) {
    await connection.rollback();
    console.error('Error updating profile in MySQL:', error);
    return { success: false, message: 'Gagal memperbarui profil di database.' };
  } finally {
      connection.release();
  }
}

// --- OPINION UPLOAD ACTION (Migrated to MySQL) ---

const opinionUploadSchema = z.object({
    postedOn: z.string().min(1, "Waktu harus diisi"),
    title: z.string().min(1, "Judul harus diisi"),
    tags: z.array(z.string()).min(1, "Pilih setidaknya satu tag"),
    content: z.string().min(1, "Isi tidak boleh kosong"),
    imageUrl: z.string().url("URL Gambar tidak valid.").min(1, "Gambar harus diunggah."),
});


export async function handleOpinionUpload(prevState: any, formData: FormData) {
    await verifyAuth(); // Secure this action
    if (!db) {
      return { success: false, message: 'Database tidak tersedia. Gagal mengunggah opini.', errors: null };
    }
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
        const sql = `INSERT INTO content (content_type, title, tags, content, image_url, posted_on) VALUES (?, ?, ?, ?, ?, ?)`;
        const values = ['opinion', title, JSON.stringify(tags), content, imageUrl, postedOn];
        
        await db.query(sql, values);

        revalidatePath('/');
        revalidatePath('/opini');
        revalidatePath('/admin01');
        return { success: true, message: 'Opini berhasil diunggah!', errors: null };
    } catch (error) {
        console.error('Error uploading opinion to MySQL:', error);
        return { success: false, message: 'Gagal mengunggah opini.', errors: null };
    }
}

// --- PUBLICATION UPLOAD ACTION (Migrated to MySQL) ---

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
    await verifyAuth(); // Secure this action
    if (!db) {
      return { success: false, message: 'Database tidak tersedia. Gagal mengunggah publikasi.', errors: null };
    }
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
        // In a real app, you might want to generate a viewUrl differently
        const viewUrl = fileUrl; 
        
        const sql = `INSERT INTO content (content_type, title, tags, description, file_url, view_url, status, image_url, published_on) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = ['publication', title, JSON.stringify(tags), description, fileUrl, viewUrl, status, imageUrl, publishedOn];

        await db.query(sql, values);

        revalidatePath('/');
        revalidatePath('/publikasi');
        revalidatePath('/admin01');
        return { success: true, message: 'Publikasi berhasil diunggah!', errors: null };
    } catch (error) {
        console.error('Error uploading publication to MySQL:', error);
        return { success: false, message: 'Gagal mengunggah publikasi.', errors: null };
    }
}

// --- ONGOING RESEARCH UPLOAD ACTION (Migrated to MySQL) ---

const ongoingUploadSchema = z.object({
    startedOn: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Format tanggal tidak valid." }),
    title: z.string().min(1, "Judul harus diisi"),
    tags: z.array(z.string()).min(1, "Pilih setidaknya satu tag"),
    description: z.string().min(1, "Deskripsi tidak boleh kosong"),
    imageUrl: z.string().url("URL Gambar tidak valid.").min(1, "Gambar harus diunggah."),
});

export async function handleOngoingUpload(prevState: any, formData: FormData) {
    await verifyAuth(); // Secure this action
    if (!db) {
      return { success: false, message: 'Database tidak tersedia. Gagal mengunggah riset.', errors: null };
    }
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

        const sql = `INSERT INTO content (content_type, title, tags, description, image_url, started_on) VALUES (?, ?, ?, ?, ?, ?)`;
        const values = ['ongoing', title, JSON.stringify(tags), description, imageUrl, new Date(startedOn)];

        await db.query(sql, values);

        revalidatePath('/');
        revalidatePath('/ongoing');
        revalidatePath('/admin01');
        return { success: true, message: 'Riset berhasil diunggah!', errors: null };
    } catch (error) {
        console.error('Error uploading ongoing research to MySQL:', error);
        return { success: false, message: 'Gagal mengunggah riset.', errors: null };
    }
}

// --- DELETE CONTENT ACTION (Migrated to MySQL) ---
export async function handleDeleteContent(contentId: number | string) {
  await verifyAuth(); // Secure this action
  if (!db) {
    return { success: false, message: 'Database tidak tersedia. Gagal menghapus konten.' };
  }
  const id = Number(contentId);
  if (isNaN(id) || id <= 0) {
    return { success: false, message: 'ID Konten tidak valid.' };
  }
  try {
    await db.query('DELETE FROM content WHERE id = ?', [id]);

    revalidatePath('/admin01');
    revalidatePath('/');
    revalidatePath('/opini');
    revalidatePath('/publikasi');
    revalidatePath('/ongoing');

    return { success: true, message: 'Konten berhasil dihapus.' };
  } catch (error) {
    console.error('Error deleting content from MySQL:', error);
    return { success: false, message: 'Gagal menghapus konten dari database.' };
  }
}


// --- FEEDBACK SUBMIT ACTION (Flow remains the same, but flow now writes to Firestore) ---
// Note: The `saveFeedback` flow still writes to Firestore.
// It can be migrated separately if needed.

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
    // The underlying AI flow still points to Firestore.
    // This is a separate concern from the main content data migration.
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
