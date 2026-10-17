"use client";

/**
 * Firebase web SDK init — configured entirely through NEXT_PUBLIC_FIREBASE_*
 * env vars (Vercel: Project Settings → Environment Variables). Until every
 * value is present the app behaves exactly as before: features disabled,
 * nothing stored locally.
 *
 * Two app instances are initialised against the SAME project:
 *  - default app  → public site (visitor accounts, favourites, catalogue)
 *  - "halcyon-admin" app → admin console only
 * Firebase Auth persists sessions per app instance, so signing into /admin
 * never signs the public site in (and vice versa). Firestore is shared.
 */

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

export const firebaseConfigured = Boolean(
  config.apiKey && config.authDomain && config.projectId && config.appId,
);

export const firebaseProjectId = config.projectId;

const ADMIN_APP_NAME = "halcyon-admin";

function appByName(name: string): FirebaseApp {
  if (!firebaseConfigured) throw new Error("Firebase is not configured");
  const existing = getApps().find((a) => a.name === name);
  if (existing) return existing;
  return initializeApp(config, name);
}

function publicApp(): FirebaseApp {
  return appByName("[DEFAULT]");
}

function adminFirebaseApp(): FirebaseApp {
  return appByName(ADMIN_APP_NAME);
}

/** Public-site auth (visitor accounts). */
export function firebaseAuth(): Auth {
  return getAuth(publicApp());
}

/** Admin-console auth — isolated session from the public site. */
export function adminAuth(): Auth {
  return getAuth(adminFirebaseApp());
}

/** Shared Firestore (same database for both). */
export function firebaseDb(): Firestore {
  return getFirestore(publicApp());
}

/**
 * Firestore bound to the admin app instance — its security-rule reads see the
 * admin auth session (used for the admins/{uid} membership check on login).
 */
export function adminDb(): Firestore {
  return getFirestore(adminFirebaseApp());
}
