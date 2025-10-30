import { App, cert, getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { Firestore, getFirestore } from "firebase-admin/firestore";

let cachedApp: App | null = null;
let cachedFirestore: Firestore | null = null;
let cachedAuth: Auth | null = null;

const resolveFirebaseCredential = () => {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    return cert({ projectId, clientEmail, privateKey });
  }

  return applicationDefault();
};

export const getAdminApp = (): App => {
  if (cachedApp) {
    return cachedApp;
  }

  if (getApps().length > 0) {
    cachedApp = getApps()[0]!;
    return cachedApp;
  }

  cachedApp = initializeApp({
    credential: resolveFirebaseCredential(),
  });

  return cachedApp;
};

export const getAdminFirestore = (): Firestore => {
  if (cachedFirestore) {
    return cachedFirestore;
  }

  cachedFirestore = getFirestore(getAdminApp());
  return cachedFirestore;
};

export const getAdminAuth = (): Auth => {
  if (cachedAuth) {
    return cachedAuth;
  }

  cachedAuth = getAuth(getAdminApp());
  return cachedAuth;
};
