import {
  getApps,
  initializeApp,
  applicationDefault,
  cert,
  AppOptions,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const projectId =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  "erpsim-project";

function resolveCredential(): AppOptions["credential"] | undefined {
  try {
    return applicationDefault();
  } catch (error) {
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      return cert({
        projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      });
    }
    console.warn(
      "Firebase admin credentials were not provided. Firestore server actions will fail without credentials."
    );
    return undefined;
  }
}

const credential = resolveCredential();

const adminApp = getApps()[0]
  ? getApps()[0]
  : initializeApp(
      credential
        ? {
            credential,
            projectId,
          }
        : { projectId }
    );

export const adminAuth = getAuth(adminApp);
export const adminFirestore = getFirestore(adminApp);
