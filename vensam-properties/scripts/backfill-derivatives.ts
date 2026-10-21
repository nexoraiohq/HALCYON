/**
 * The Img component's srcSet always advertises 480/960/1440/2000 candidates.
 * Images whose source is smaller than a given width had that width skipped,
 * so the browser picked a 404 candidate and rendered nothing. This backfills
 * every missing width (upscaling where the source is smaller — visually the
 * same as the old inline data-URI stretched by CSS).
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const WIDTHS = [480, 960, 1440, 2000];
const MEDIA = join(process.cwd(), "public", "media");

async function main() {
  const { readdirSync } = await import("node:fs");
  const masters = readdirSync(MEDIA).filter(
    (f) => f.endsWith(".jpg") && !/-(480|960|1440|2000)\.jpg$/.test(f),
  );
  let made = 0;
  for (const master of masters) {
    const stem = master.replace(/\.jpg$/, "");
    for (const w of WIDTHS) {
      const webp = join(MEDIA, `${stem}-${w}.webp`);
      const avif = join(MEDIA, `${stem}-${w}.avif`);
      if (!existsSync(webp)) {
        await sharp(join(MEDIA, master))
          .resize({ width: w }) // allow upscaling so the advertised candidate exists
          .webp({ quality: 72, effort: 5 })
          .toFile(webp);
        console.log(`${stem}-${w}.webp`);
        made++;
      }
      if (!existsSync(avif)) {
        await sharp(join(MEDIA, master))
          .resize({ width: w })
          .avif({ quality: 58, effort: 4 })
          .toFile(avif);
        console.log(`${stem}-${w}.avif`);
        made++;
      }
    }
  }
  console.log(`backfilled ${made} files`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
