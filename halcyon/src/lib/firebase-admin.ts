/**
 * Firebase Admin SDK — server-only (SSR reads in server-api.ts and the seed
 * script). Creds come from FIREBASE_SERVICE_ACCOUNT: the full service-account
 * JSON pasted as one line (raw or base64), set as an env var locally and on
 * Vercel. Nothing here runs in the browser.
 */

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function parseServiceAccount(): Record<string, string> | null {
  const raw = (process.env.FIREBASE_SERVICE_ACCOUNT ?? "").trim();
  if (!raw) return null;
  const attempts = [raw];
  try {
    attempts.push(Buffer.from(raw, "base64").toString("utf8"));
  } catch {
    /* not base64 */
  }
  for (const attempt of attempts) {
    try {
      const parsed = JSON.parse(attempt) as Record<string, string>;
      if (parsed.project_id && parsed.client_email) return parsed;
    } catch {
      /* try next */
    }
  }
  return null;
}

let adminApp: App | null = null;

export function adminConfigured(): boolean {
  return Boolean(parseServiceAccount() && (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? process.env.FIREBASE_PROJECT_ID));
}

export function adminAppInstance(): App {
  if (adminApp) return adminApp;
  const sa = parseServiceAccount();
  if (!sa) throw new Error("FIREBASE_SERVICE_ACCOUNT is not set");
  adminApp =
    getApps()[0] ??
    initializeApp({
      credential: cert(sa),
      projectId: sa.project_id,
    });
  return adminApp;
}

export function adminDb() {
  return getFirestore(adminAppInstance());
}

export function adminAuth() {
  return getAuth(adminAppInstance());
}
