import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import admin from 'firebase-admin';
import path from 'path';

// Initialize Firebase Admin
// On cloud (Render): reads FIREBASE_SERVICE_ACCOUNT_BASE64 env var (base64-encoded JSON)
// Locally: falls back to firebase-key.json file
if (!admin.apps.length) {
  let serviceAccount: admin.ServiceAccount;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    // Cloud deployment: decode from Base64 env var
    const decoded = Buffer.from(
      process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
      'base64'
    ).toString('utf-8');
    serviceAccount = JSON.parse(decoded) as admin.ServiceAccount;
  } else {
    // Local development: load from file
    const serviceAccountPath = path.resolve(__dirname, '../../firebase-key.json');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    serviceAccount = require(serviceAccountPath) as admin.ServiceAccount;
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: any;
  firebaseUid?: string;
  firebaseUser?: admin.auth.DecodedIdToken;
}

// Middleware 1: Only verifies that the Firebase token is valid
export const verifyFirebaseToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      req.firebaseUid = decodedToken.uid;
      req.firebaseUser = decodedToken;
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      next(new Error('Not authorized, Firebase token failed'));
    }
  } else {
    res.status(401);
    next(new Error('Not authorized, no token provided'));
  }
};

// Middleware 2: Ensures the user exists in our Postgres Database (used for other routes)
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // First verify the firebase token
  verifyFirebaseToken(req, res, async () => {
    try {
      if (req.firebaseUid) {
        req.user = await prisma.user.findUnique({
          where: { firebaseUid: req.firebaseUid },
          select: { id: true, name: true, email: true, role: true, firebaseUid: true },
        });

        if (!req.user) {
          res.status(404);
          throw new Error('User record not found in system. Please hit /api/auth/sync first.');
        }

        next();
      }
    } catch (error) {
       next(error);
    }
  });
};

// Middleware 3: Ensures the user has the 'admin' role
export const adminProtect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  protect(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403);
      next(new Error('Not authorized as an admin'));
    }
  });
};
