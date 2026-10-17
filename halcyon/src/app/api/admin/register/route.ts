import { NextResponse } from "next/server";
import { adminAuth, adminDb, adminConfigured } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  if (!adminConfigured()) {
    return NextResponse.json({ error: "Server is not configured." }, { status: 503 });
  }
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = (body.email ?? "").trim();
    const password = body.password ?? "";
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password needs at least 6 characters." }, { status: 400 });
    }

    // Create the Firebase Auth user via the Admin SDK (bypasses client rules).
    const auth = await adminAuth();
    const user = await auth.createUser({ email, password });

    // Store the admin membership doc.
    const db = await adminDb();
    await db.collection("admins").doc(user.uid).set({
      email,
      role: "admin",
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, uid: user.uid });
  } catch (err) {
    const code = (err as { code?: string }).code ?? "";
    let msg = "Could not create the admin account.";
    if (code === "auth/email-already-exists") msg = "An account with that email already exists.";
    else if (code === "auth/invalid-email") msg = "That email address is not valid.";
    else if (code === "auth/weak-password") msg = "Password needs at least 6 characters.";
    else if (err instanceof Error && err.message) msg = err.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
