
import admin from 'firebase-admin';

// Periksa apakah aplikasi dengan nama "[DEFAULT]" sudah diinisialisasi.
// Ini adalah pola yang lebih andal untuk mencegah inisialisasi ganda di lingkungan hot-reload Next.js.
if (!admin.apps.some(app => app?.name === '[DEFAULT]')) {
  try {
    // Ketika berjalan di lingkungan Google Cloud (seperti Firebase Studio),
    // SDK dapat secara otomatis mendeteksi kredensial akun layanan tanpa konfigurasi eksplisit.
    admin.initializeApp();
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.stack);
  }
}

const db = admin.firestore();

export { db };
