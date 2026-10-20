/**
 * Firebase Admin SDK — server-only (SSR reads in server-api.ts and the seed
 * script). Creds come from FIREBASE_SERVICE_ACCOUNT: the full service-account
 * JSON pasted as one line (raw or base64), set as an env var locally and on
 * Vercel. Nothing here runs in the browser.
 *
 * The SDK loads lazily via dynamic import() so it never executes at module
 * scope: on Vercel, firebase-admin/auth (jwks-rsa → jose, ESM-only) can throw
 * ERR_REQUIRE_ESM under older Node runtimes. Keeping it out of module scope
 * lets callers catch that and fall back to seed data instead of a 500.
 */

import type { App } from "firebase-admin/app";

type AppModule = typeof import("firebase-admin/app");
type FirestoreModule = typeof import("firebase-admin/firestore");
type AuthModule = typeof import("firebase-admin/auth");

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
let dataPromise: Promise<{ app: AppModule; firestore: FirestoreModule }> | null = null;
let authPromise: Promise<AuthModule> | null = null;

function loadData(): Promise<{ app: AppModule; firestore: FirestoreModule }> {
  if (!dataPromise) {
    dataPromise = Promise.all([
      import("firebase-admin/app"),
      import("firebase-admin/firestore"),
    ])
      .then(([app, firestore]) => ({ app, firestore }))
      .catch((err) => {
        dataPromise = null; // allow retry on next request
        throw err;
      });
  }
  return dataPromise;
}

function loadAuth(): Promise<AuthModule> {
  if (!authPromise) {
    authPromise = import("firebase-admin/auth").catch((err) => {
      authPromise = null;
      throw err;
    });
  }
  return authPromise;
}

export function adminConfigured(): boolean {
  return Boolean(
    parseServiceAccount() && (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? process.env.FIREBASE_PROJECT_ID),
  );
}

async function ensureApp(): Promise<App> {
  if (adminApp) return adminApp;
  const sa = parseServiceAccount();
  if (!sa) throw new Error("FIREBASE_SERVICE_ACCOUNT is not set");
  const { app } = await loadData();
  adminApp =
    app.getApps()[0] ??
    app.initializeApp({
      credential: app.cert(sa),
      projectId: sa.project_id,
    });
  return adminApp;
}

export async function adminDb() {
  const [instance, { firestore }] = await Promise.all([ensureApp(), loadData()]);
  return firestore.getFirestore(instance);
}

export async function adminAuth() {
  const [instance, auth] = await Promise.all([ensureApp(), loadAuth()]);
  return auth.getAuth(instance);
}
