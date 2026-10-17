/**
 * Server-side data access for the public marketing pages — reads straight
 * from Cloud Firestore via the Admin SDK (service account env var).
 *
 * Until FIREBASE_SERVICE_ACCOUNT is configured the bundled presentation copy
 * (seed data) keeps the site looking finished; once Firestore is connected
 * the database is the single source of truth (an empty database means the
 * pages render empty — run `npm run seed` after connecting).
 */

import { cache } from "react";
import { agents as seedAgents, journal as seedJournal, properties as seedProperties } from "./data";
import type { Agent, JournalPost, Property } from "./api-types";
import { adminConfigured, adminDb } from "./firebase-admin";

export const serverApiConfigured = adminConfigured();

async function listCol<T>(name: string, fallback: T[]): Promise<T[]> {
  if (!serverApiConfigured) return fallback;
  try {
    const db = await adminDb();
    const snap = await db.collection(name).get();
    return snap.docs.map((d) => d.data() as T);
  } catch {
    // Transient Firestore error — keep the site alive on presentation copy.
    return fallback;
  }
}

export const getProperties = cache(async (): Promise<Property[]> =>
  listCol<Property>("properties", seedProperties),
);

export const getAgents = cache(async (): Promise<Agent[]> => listCol<Agent>("agents", seedAgents));

export const getJournal = cache(async (): Promise<JournalPost[]> =>
  listCol<JournalPost>("journal", seedJournal as JournalPost[]),
);
