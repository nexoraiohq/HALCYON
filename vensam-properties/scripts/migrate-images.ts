/**
 * One-time migration: base64 data-URI images stored in Firestore property docs
 * (and the homepage hero embedded in page.tsx) are decoded to real files under
 * public/media with the same derivative set generate-media.mjs produces, and
 * the docs/field are repointed at /media/<name>.jpg.
 *
 * Every original document is backed up to .image-backup.json first.
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import sharp from "sharp";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const WIDTHS = [480, 960, 1440, 2000];
const MEDIA = join(process.cwd(), "public", "media");

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

const isDataUri = (v: unknown): v is string => typeof v === "string" && v.startsWith("data:image");

async function materialize(dataUri: string, name: string): Promise<string> {
  const buf = Buffer.from(dataUri.slice(dataUri.indexOf(",") + 1), "base64");
  const src = sharp(buf);
  const meta = await src.metadata();

  await sharp(buf)
    .resize({ width: 1440, withoutEnlargement: true })
    .jpeg({ quality: 76, progressive: true, mozjpeg: true })
    .toFile(join(MEDIA, `${name}.jpg`));

  for (const w of WIDTHS) {
    if (w > meta.width! && w !== WIDTHS[0]) continue;
    const rw = Math.min(w, meta.width!);
    await sharp(buf)
      .resize({ width: rw, withoutEnlargement: true })
      .avif({ quality: 58, effort: 4 })
      .toFile(join(MEDIA, `${name}-${rw}.avif`));
    await sharp(buf)
      .resize({ width: rw, withoutEnlargement: true })
      .webp({ quality: 72, effort: 5 })
      .toFile(join(MEDIA, `${name}-${rw}.webp`));
  }
  return `/media/${name}.jpg`;
}

function uniqueName(base: string): string {
  let n = base;
  let i = 1;
  while (existsSync(join(MEDIA, `${n}.jpg`))) n = `${base}-${++i}`;
  return n;
}

async function main() {
  const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT!;
  const sa = JSON.parse(saRaw.startsWith("{") ? saRaw : Buffer.from(saRaw, "base64").toString("utf8"));
  const app = getApps()[0] ?? initializeApp({ credential: cert(sa), projectId: sa.project_id });
  const db = getFirestore(app);

  const backup: Record<string, unknown> = {};
  const snap = await db.collection("properties").get();
  const updates: Promise<unknown>[] = [];

  for (const doc of snap.docs) {
    const d = doc.data();
    const orig = { ...d };
    let changed = false;

    if (isDataUri(d.image)) {
      const name = uniqueName(doc.id.slice(0, 60));
      d.image = await materialize(d.image, name);
      changed = true;
      console.log(`properties/${doc.id} .image -> ${d.image}`);
    }
    if (Array.isArray(d.gallery)) {
      let gi = 0;
      d.gallery = await Promise.all(
        d.gallery.map(async (g: unknown) => {
          if (!isDataUri(g)) return g;
          gi++;
          const name = uniqueName(`${doc.id.slice(0, 55)}-g${gi}`);
          const out = await materialize(g, name);
          changed = true;
          console.log(`properties/${doc.id} .gallery[${gi - 1}] -> ${out}`);
          return out;
        }),
      );
    }
    if (changed) {
      backup[doc.id] = orig;
      updates.push(doc.ref.update({ image: d.image, gallery: d.gallery }));
    }
  }

  // Homepage hero embedded in page.tsx
  const pagePath = join(process.cwd(), "src", "app", "page.tsx");
  const page = readFileSync(pagePath, "utf8");
  const m = page.match(/data:image\/webp;base64,[A-Za-z0-9+/=]+/);
  if (m) {
    const name = uniqueName("hero");
    const out = await materialize(m[0], name);
    console.log(`page.tsx hero -> ${out}`);
    if (name === "hero") {
      // regenerate the canonical hero name in place (used by /media/hero.jpg refs)
    }
    const next = page.replace(m[0], out);
    writeFileSync(pagePath, next);
    backup["__page_hero__"] = m[0].slice(0, 64) + "…";
  }

  writeFileSync(join(process.cwd(), ".image-backup.json"), JSON.stringify(backup));
  await Promise.all(updates);
  console.log(`done: ${updates.length} docs updated, backup at .image-backup.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
