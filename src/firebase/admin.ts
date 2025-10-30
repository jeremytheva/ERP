import { App, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let app: App | undefined;

function getOrInitApp(): App {
  if (!app) {
    if (getApps().length === 0) {
      app = initializeApp();
    } else {
      app = getApps()[0]!;
    }
  }

  return app;
}

export function getAdminFirestore() {
  return getFirestore(getOrInitApp());
}
