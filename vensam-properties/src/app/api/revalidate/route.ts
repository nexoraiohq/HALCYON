import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { adminAuth, adminConfigured, adminDb } from "@/lib/firebase-admin";

async function isAdminToken(token: string): Promise<boolean> {
  if (!adminConfigured()) return false;
  try {
    const auth = await adminAuth();
    const decoded = await auth.verifyIdToken(token);
    const db = await adminDb();
    const snap = await db.collection("admins").doc(decoded.uid).get();
    return snap.exists;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  // Path 1: server-only shared secret (scripts / CI). Never shipped to the browser.
  const secret = process.env.REVALIDATE_SECRET;
  if (secret && req.headers.get("x-revalidate-secret") === secret) {
    revalidatePath("/", "layout");
    return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
  }
  // Path 2: a signed-in admin (Firebase ID token, verified server-side
  // against admins/{uid}) — used by the admin console after mutations.
  const auth = req.headers.get("authorization") ?? "";
  if (auth.startsWith("Bearer ") && (await isAdminToken(auth.slice(7)))) {
    revalidatePath("/", "layout");
    return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
  }
  return NextResponse.json({ error: "Not allowed." }, { status: 401 });
}
