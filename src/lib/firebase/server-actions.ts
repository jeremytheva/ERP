"use server";

import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";

import { getAdminFirestore } from "./admin";
import {
  FirestoreUserDocument,
  ROLE_DEFINITIONS,
  RoleSlug,
  isRoleSlug,
} from "./firestore-schema";
import { ACTIVE_ROLE_COOKIE, ROLE_COOKIE_MAX_AGE } from "./constants";

const setRoleCookie = async (roleId: RoleSlug | null) => {
  const store = await cookies();

  if (!roleId) {
    store.set({
      name: ACTIVE_ROLE_COOKIE,
      value: "",
      maxAge: 0,
      path: "/",
    });
    return;
  }

  store.set({
    name: ACTIVE_ROLE_COOKIE,
    value: roleId,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ROLE_COOKIE_MAX_AGE,
  });
};

export const ensureUserDocument = async (uid: string) => {
  const firestore = getAdminFirestore();
  const userRef = firestore.collection("users").doc(uid);
  const snapshot = await userRef.get();

  if (!snapshot.exists) {
    const seed: FirestoreUserDocument = {
      uid,
      activeRoleId: null,
      roles: {},
    };

    await userRef.set(
      {
        ...seed,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return seed;
  }

  const data = snapshot.data() as FirestoreUserDocument;
  return {
    uid,
    activeRoleId: data.activeRoleId ?? null,
    roles: data.roles ?? {},
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  } satisfies FirestoreUserDocument;
};

export const persistRoleSelection = async ({
  uid,
  roleId,
}: {
  uid: string;
  roleId: RoleSlug;
}) => {
  if (!isRoleSlug(roleId)) {
    throw new Error(`Unsupported role id: ${roleId}`);
  }

  const firestore = getAdminFirestore();
  const userRef = firestore.collection("users").doc(uid);
  const roleDefinition = ROLE_DEFINITIONS[roleId];

  await userRef.set(
    {
      uid,
      activeRoleId: roleId,
      roles: {
        [roleId]: {
          id: roleDefinition.id,
          displayName: roleDefinition.displayName,
          avatarUrl: roleDefinition.avatarUrl,
          lastSelectedAt: FieldValue.serverTimestamp(),
        },
      },
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await setRoleCookie(roleId);

  return { roleId };
};

export const fetchUserRoleSelection = async (uid: string) => {
  const firestore = getAdminFirestore();
  const userRef = firestore.collection("users").doc(uid);
  const snapshot = await userRef.get();

  if (!snapshot.exists) {
    return { activeRoleId: null as RoleSlug | null, roles: {} };
  }

  const data = snapshot.data() as FirestoreUserDocument;
  const activeRoleId = isRoleSlug(data.activeRoleId) ? data.activeRoleId : null;

  if (activeRoleId) {
    await setRoleCookie(activeRoleId);
  }

  return {
    activeRoleId,
    roles: data.roles ?? {},
  };
};

export const clearRoleSession = async () => {
  await setRoleCookie(null);
};
