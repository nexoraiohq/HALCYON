/**
 * Seed Firestore with VENSAM PROPERTIES's catalogue and (optionally) the first admin.
 *
 * Usage:
 *   1. Set FIREBASE_SERVICE_ACCOUNT (service-account JSON, one line) and
 *      FIREBASE_PROJECT_ID in the environment (or a .env file via `dotenv`).
 *   2. Optional admin bootstrap: set ADMIN_EMAIL + ADMIN_PASSWORD.
 *   3. Run:  npm run seed
 *
 * Safe to re-run — documents are upserted by slug.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { agents, journal, properties } from "../src/lib/data";

function loadDotEnv(): void {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const [, key, value] = m;
      if (!(key in process.env)) process.env[key] = value.replace(/^["']|["']$/g, "");
    }
  } catch {
    /* no .env file */
  }
}

function serviceAccount(): Record<string, string> {
  const raw = (process.env.FIREBASE_SERVICE_ACCOUNT ?? "").trim();
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT is not set");
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
  throw new Error("FIREBASE_SERVICE_ACCOUNT is not valid service-account JSON");
}

async function main(): Promise<void> {
  loadDotEnv();
  const sa = serviceAccount();
  const app =
    getApps()[0] ??
    initializeApp({ credential: cert(sa), projectId: process.env.FIREBASE_PROJECT_ID ?? sa.project_id });
  const db = getFirestore(app);
  const auth = getAuth(app);

  /* Catalogue — upsert by slug */
  for (const p of properties) {
    await db.collection("properties").doc(p.slug).set(p);
  }
  for (const a of agents) {
    await db.collection("agents").doc(a.slug).set(a);
  }
  for (const j of journal) {
    await db.collection("journal").doc(j.slug).set(j as unknown as Record<string, unknown>);
  }
  console.log(`Seeded ${properties.length} properties, ${agents.length} agents, ${journal.length} journal posts.`);

  /* Optional admin bootstrap */
  const email = (process.env.ADMIN_EMAIL ?? "").trim();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (email && password) {
    let uid: string;
    try {
      const user = await auth.createUser({ email, password, displayName: "Vensam Properties Admin" });
      uid = user.uid;
      console.log(`Created admin user ${email} (${uid}).`);
    } catch (err) {
      if ((err as { code?: string }).code === "auth/email-already-exists") {
        const user = await auth.getUserByEmail(email);
        uid = user.uid;
        console.log(`Admin user ${email} already exists (${uid}).`);
      } else {
        throw err;
      }
    }
    await db.collection("admins").doc(uid).set({ email, role: "admin" });
    console.log(`Granted admin access to ${email}.`);
  } else {
    console.log("ADMIN_EMAIL/ADMIN_PASSWORD not set — skipped admin bootstrap.");
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
