import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

if (admin.apps.length === 0) {
  // Ketika berjalan di lingkungan Google Cloud (seperti Firebase Studio),
  // SDK dapat secara otomatis mendeteksi kredensial akun layanan.
  admin.initializeApp();
}

// Inisialisasi Firestore sekali dan ekspor instance-nya.
const db = getFirestore();

export { db };
