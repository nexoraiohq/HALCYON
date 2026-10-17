import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "public", "media");
const WIDTHS = [480, 960, 1440, 2000];

const IMAGES = [
  ["hero", "pexels:30781823", 2600],
  ["p1", "photo-1600585154340-be6161a56a0c"],
  ["p2", "photo-1600607687939-ce8a6c25118c"],
  ["p3", "photo-1512917774080-9991f1c4c750"],
  ["p4", "photo-1600566753086-00f18fb6b3ea"],
  ["p5", "photo-1613490493576-7fde63acd811"],
  ["p6", "photo-1600047509807-ba8f99d2cdde"],
  ["p7", "photo-1600210492486-724fe5c67fb0"],
  ["p8", "photo-1600573472550-8090b5e0745e"],
  ["p9", "photo-1580587771525-78b9dba3b914"],
  ["p10", "photo-1567496898669-ee935f5f647a"],
  ["p11", "photo-1600585154526-990dced4db0d"],
  ["p12", "photo-1512918728675-ed5a9ecdebfd"],
  ["a1", "pexels:32358666"],
  ["a2", "pexels:17943555"],
  ["a3", "pexels:4183527"],
  ["a4", "pexels:38197025"],
  ["a5", "pexels:17049766"],
  ["a6", "pexels:6050436"],
  ["n1", "pexels:34762961"],
  ["n2", "https://i.pinimg.com/1200x/83/6a/28/836a28935df571d6c821e5f116cc7196.jpg"],
  ["n3", "https://i.pinimg.com/originals/e1/64/7b/e1647b2ebbe36673ff228cf9aca1d9ed.jpg"],
  ["n4", "https://i.pinimg.com/1200x/a1/b4/99/a1b499dd3474e1dbb3345140dae43788.jpg"],
  ["n5", "https://i.pinimg.com/originals/16/ae/1b/16ae1bc88fdc16aee56a13497c6e2791.jpg"],
  ["b1", "photo-1497366754035-f200968a6e72"],
  ["b2", "photo-1497366811353-6870744d04b2"],
  ["b3", "photo-1524758631624-e2822e304c36"],
  ["b4", "photo-1600607687920-4e2a09cf159d"],
];

async function download(name, id, width = 2000) {
  const file = path.join(ROOT, `_src-${name}.jpg`);
  const url = id.startsWith("pexels:")
    ? `https://images.pexels.com/photos/${id.slice(7)}/pexels-photo-${id.slice(7)}.jpeg?auto=compress&cs=tinysrgb&w=${width}`
    : id.startsWith("http")
      ? id
      : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`${name}: ${res.status}`);
  await fs.writeFile(file, Buffer.from(await res.arrayBuffer()));
  return file;
}

async function run() {
  await fs.mkdir(ROOT, { recursive: true });
  const only = process.argv.slice(2);
  const entries = await fs.readdir(ROOT);
  await Promise.all(
    entries.filter((e) => e.startsWith("_src-")).map((e) => fs.unlink(path.join(ROOT, e))),
  );

  const wanted = only.length ? IMAGES.filter(([name]) => only.includes(name)) : IMAGES;
  if (!wanted.length) throw new Error(`no images match: ${only.join(", ")}`);

  for (let i = 0; i < wanted.length; i++) {
    const [name, id, width] = wanted[i];
    const src = await download(name, id, width);

    const pipeline = () => sharp(src);
    const finalMeta = await pipeline().metadata();

    await pipeline()
      .resize({ width: 1440, withoutEnlargement: true })
      .jpeg({ quality: 76, progressive: true, mozjpeg: true })
      .toFile(path.join(ROOT, `${name}.jpg`));

    for (const w of WIDTHS) {
      if (w > finalMeta.width && w !== WIDTHS[0]) continue;
      const rw = Math.min(w, finalMeta.width);
      await pipeline()
        .resize({ width: rw, withoutEnlargement: true })
        .avif({ quality: 58, effort: 4 })
        .toFile(path.join(ROOT, `${name}-${rw}.avif`));
      await pipeline()
        .resize({ width: rw, withoutEnlargement: true })
        .webp({ quality: 72, effort: 5 })
        .toFile(path.join(ROOT, `${name}-${rw}.webp`));
    }

    await fs.unlink(src);
    process.stdout.write(`${i + 1}/${wanted.length} ${name} ok\n`);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
