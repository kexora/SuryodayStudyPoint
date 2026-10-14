import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import dotenv from 'dotenv';

dotenv.config();

const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const projectId = 'kexora-crhs';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    storageBucket: 'kexora-crhs.appspot.com'
  });
}

async function fixCors() {
  try {
    const bucket = getStorage().bucket();
    await bucket.setCorsConfiguration([
      {
        origin: ['*'],
        method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
        responseHeader: ['*'],
        maxAgeSeconds: 3600,
      },
    ]);
    console.log('CORS successfully configured for Firebase Storage!');
  } catch (err) {
    console.error('Error setting CORS:', err);
  }
}

fixCors();
