import admin from 'firebase-admin';
import path from 'path';

if (!admin.apps.length) {
  let serviceAccount: admin.ServiceAccount | undefined;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    try {
      const decoded = Buffer.from(
        process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
        'base64'
      ).toString('utf-8');
      serviceAccount = JSON.parse(decoded) as admin.ServiceAccount;
    } catch (err) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64:', err);
    }
  } else {
    try {
      const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS 
        ? path.resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS)
        : path.resolve(process.cwd(), 'firebase-key.json');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      serviceAccount = require(keyPath) as admin.ServiceAccount;
    } catch (err) {
      console.warn('Local firebase-key.json not found, falling back to default app credentials.');
    }
  }

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "justicepal-a8bb3.firebasestorage.app",
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "justicepal-a8bb3.firebasestorage.app",
    });
  }
}

export default admin;
