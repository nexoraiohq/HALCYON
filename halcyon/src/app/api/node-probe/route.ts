import { createRequire } from "node:module";
import { NextResponse } from "next/server";
import { adminAuth, adminDb, adminConfigured } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const out: Record<string, unknown> = {
    node: process.version,
    execArgv: process.execArgv,
    configured: adminConfigured(),
  };
  try {
    const req = createRequire(import.meta.url);
    req("jose");
    out.requireJose = "OK";
  } catch (e) {
    const err = e as Error & { code?: string };
    out.requireJose = `${err.code ?? ""} :: ${err.message?.split("\n")[0]}`;
  }
  try {
    const auth = await adminAuth();
    const page = await auth.listUsers(1);
    out.auth = `OK (${page.users.length} listed)`;
  } catch (e) {
    out.auth = `FAIL: ${(e as Error).message?.split("\n")[0]}`;
  }
  try {
    const db = await adminDb();
    const snap = await db.collection("properties").limit(1).get();
    out.firestore = `OK (docs=${snap.docs.length})`;
  } catch (e) {
    out.firestore = `FAIL: ${(e as Error).message?.split("\n")[0]}`;
  }
  return NextResponse.json(out);
}
