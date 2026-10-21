import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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
    /* no .env */
  }
}
loadDotEnv();

const sa = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT!.startsWith("{")
    ? process.env.FIREBASE_SERVICE_ACCOUNT!
    : Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT!, "base64").toString("utf8"),
);

const app = getApps()[0] ?? initializeApp({ credential: cert(sa), projectId: sa.project_id });
const db = getFirestore(app);

function scan(value: unknown, path: string, hits: string[], total: { kb: number }) {
  if (typeof value === "string") {
    if (value.startsWith("data:image")) {
      hits.push(`${path}  ${Math.round(value.length / 1024)}KB  ${value.slice(0, 30)}`);
      total.kb += value.length / 1024;
    }
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => scan(v, `${path}[${i}]`, hits, total));
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) scan(v, `${path}.${k}`, hits, total);
  }
}

(async () => {
  for (const col of ["properties", "journal", "agents", "testimonials", "posts"]) {
    const snap = await db.collection(col).get();
    let any = false;
    for (const d of snap.docs) {
      const hits: string[] = [];
      const total = { kb: 0 };
      scan(d.data(), "", hits, total);
      if (hits.length) {
        if (!any) { console.log(`\n## ${col} (${snap.size} docs)`); any = true; }
        console.log(`  doc ${d.id}: ${total.kb.toFixed(0)}KB`);
        hits.forEach((h) => console.log(`    ${h}`));
      }
    }
    if (!any) console.log(`\n## ${col} (${snap.size} docs): clean`);
  }
})();
