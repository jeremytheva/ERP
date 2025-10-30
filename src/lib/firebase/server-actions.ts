"use server";

import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { ROLE_PROFILES } from "./firestore-schema";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

const COOKIE_NAMES = {
  uid: "anonymousUid",
  role: "activeRole",
  permitted: "permittedComponents",
  defaultComponent: "roleDefaultComponent",
};

export async function createAnonymousSession() {
  const cookieStore = cookies();
  let uid = cookieStore.get(COOKIE_NAMES.uid)?.value;

  if (!uid) {
    uid = randomUUID();
    cookieStore.set(COOKIE_NAMES.uid, uid, COOKIE_OPTIONS);
  }

  return { uid };
}

export async function persistActiveRole(roleId: string) {
  const profile = ROLE_PROFILES.find((role) => role.id === roleId);

  if (!profile) {
    throw new Error("Invalid role selection");
  }

  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAMES.role, profile.id, COOKIE_OPTIONS);
  cookieStore.set(
    COOKIE_NAMES.permitted,
    profile.permittedComponents.join(","),
    COOKIE_OPTIONS,
  );
  cookieStore.set(
    COOKIE_NAMES.defaultComponent,
    profile.defaultComponent,
    COOKIE_OPTIONS,
  );

  return {
    roleId: profile.id,
    defaultComponent: profile.defaultComponent,
    permittedComponents: profile.permittedComponents,
  };
}

export async function getPersistedRole() {
  const cookieStore = cookies();
  const roleId = cookieStore.get(COOKIE_NAMES.role)?.value ?? null;
  const uid = cookieStore.get(COOKIE_NAMES.uid)?.value ?? null;
  const permittedValue = cookieStore.get(COOKIE_NAMES.permitted)?.value ?? "";
  const defaultComponent =
    cookieStore.get(COOKIE_NAMES.defaultComponent)?.value ?? "dashboard";

  const permittedComponents = permittedValue
    .split(",")
    .map((component) => component.trim())
    .filter(Boolean);

  return {
    uid,
    roleId,
    permittedComponents,
    defaultComponent,
  };
}

export async function clearSession() {
  const cookieStore = cookies();
  Object.values(COOKIE_NAMES).forEach((name) => {
    cookieStore.delete({ name, path: COOKIE_OPTIONS.path });
  });
}
