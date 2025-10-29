"use server";

import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import type { App } from "firebase-admin/app";
import { firebaseConfig } from "@/firebase/config";

let appInstance: App | null = null;

function getFirebaseAdminApp(): App {
  if (appInstance) {
    return appInstance;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!getApps().length) {
    if (clientEmail && privateKey) {
      appInstance = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      });
    } else {
      try {
        appInstance = initializeApp({
          credential: applicationDefault(),
          projectId,
        });
      } catch (error) {
        console.warn("Falling back to initializeApp without explicit credentials.", error);
        appInstance = initializeApp({ projectId });
      }
    }
  } else {
    appInstance = getApps()[0]!;
  }

  return appInstance!;
}

export function getFirebaseAdmin() {
  const app = getFirebaseAdminApp();
  const firestore = getFirestore(app);
  const auth = getAuth(app);
  return { app, firestore, auth };
}
