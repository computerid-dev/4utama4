// lib/firebaseAdmin.js
// Inisialisasi Firebase Admin SDK sekali saja (di-cache antar invocation serverless).
// Wajib set 3 environment variable ini di Vercel Project Settings > Environment Variables:
//   FIREBASE_PROJECT_ID
//   FIREBASE_CLIENT_EMAIL
//   FIREBASE_PRIVATE_KEY   (paste private_key dari service account JSON, termasuk \n)

const admin = require('firebase-admin');

function getAdmin() {
  if (!admin.apps.length) {
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
      throw new Error(
        'Firebase env vars belum diset. Cek FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY di Vercel.'
      );
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
      // Wajib diisi kalau mau pakai Realtime Database (chat real-time).
      // Ambil dari Firebase Console > Realtime Database (URL di bagian atas halaman).
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  }
  return admin;
}

function db() {
  return getAdmin().firestore();
}

// Bucket Storage untuk avatar/media. Default disamakan dengan storageBucket di firebase-init.js (client config).
function bucket() {
  return getAdmin().storage().bucket(process.env.FIREBASE_STORAGE_BUCKET || 'echonoteein.firebasestorage.app');
}

// Realtime Database - dipakai untuk pesan chat supaya bisa real-time (push instan ke listener client).
function rtdb() {
  return getAdmin().database();
}

module.exports = { getAdmin, db, bucket, rtdb };
