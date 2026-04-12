import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import admin from 'firebase-admin';

// Initialize firebase admin
// For production, ensure GOOGLE_APPLICATION_CREDENTIALS env var is centrally provided
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
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
