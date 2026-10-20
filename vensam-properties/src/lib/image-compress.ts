/**
 * In-browser image compression → data URL, sized to live inside a Firestore
 * document (1 MB hard limit). Keeps every uploaded image in the database.
 */
const MAX_DATA_URL_BYTES = 250_000;
const MAX_SOURCE_BYTES = 20 * 1024 * 1024;

export async function compressToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files can be uploaded.");
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("Source image must be under 20 MB.");
  }
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) throw new Error("This image could not be read.");
  try {
    let maxEdge = 1600;
    let quality = 0.72;
    for (let attempt = 0; attempt < 10; attempt++) {
      const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
      const w = Math.max(1, Math.round(bitmap.width * scale));
      const h = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable in this browser.");
      ctx.drawImage(bitmap, 0, 0, w, h);
      const dataUrl = await encode(canvas, quality);
      if (dataUrl.length <= MAX_DATA_URL_BYTES) return dataUrl;
      if (quality > 0.45) {
        quality -= 0.12;
      } else {
        quality = 0.5;
        maxEdge = Math.max(640, Math.round(maxEdge * 0.65));
      }
    }
    throw new Error(
      "Image stays too large for Firestore even after compression — pick a smaller photo.",
    );
  } finally {
    bitmap.close?.();
  }
}

function encode(canvas: HTMLCanvasElement, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const finish = (blob: Blob | null) => {
      if (!blob) {
        reject(new Error("Could not encode the image."));
        return;
      }
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result));
      fr.onerror = () => reject(new Error("Could not read the encoded image."));
      fr.readAsDataURL(blob);
    };
    canvas.toBlob(
      (webp) => (webp ? finish(webp) : canvas.toBlob(finish, "image/jpeg", quality)),
      "image/webp",
      quality,
    );
  });
}
