/**
 * Data layer for VENSAM PROPERTIES — Firebase Auth + Cloud Firestore called directly
 * from the app (same pattern as the agency's previous Firebase projects).
 * No REST server is involved; the exported function names match the earlier
 * REST client so components did not need to change.
 *
 * Until every NEXT_PUBLIC_FIREBASE_* env var is present, `apiConfigured` is
 * false: features stay disabled and nothing is stored in the browser.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Firestore,
} from "firebase/firestore";
import { adminAuth, adminDb, firebaseAuth, firebaseConfigured, firebaseDb, firebaseProjectId } from "./firebase";
import type { AdminUser, Agent, AuthResponse, Enquiry, EnquiryInput, HealthResponse, JournalPost, Property, UploadResponse } from "./api-types";

export const apiConfigured = firebaseConfigured;
export const API_BASE = firebaseConfigured ? `firestore://${firebaseProjectId}` : "";

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/** Thrown when Firebase is unreachable (not configured, offline, DNS, timeout). */
export class OfflineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OfflineError";
  }
}

/* In-memory mirrors of the signed-in user (Firebase Auth owns the session). */
let tokenCache = "";
let userCache: AdminUser | null = null;

export function getToken(): string {
  return tokenCache;
}

export function setToken(token: string): void {
  tokenCache = token;
}

export function getStoredUser(): AdminUser | null {
  return userCache;
}

export function setStoredUser(user: AdminUser | null): void {
  userCache = user;
}

function requireConfigured(): void {
  if (!apiConfigured) throw new OfflineError("Firebase is not configured yet");
}

function pingRevalidate(): void {
  if (typeof window === "undefined") return;
  const secret = process.env.NEXT_PUBLIC_REVALIDATE_SECRET;
  if (!secret) return;
  void fetch("/api/revalidate", {
    method: "POST",
    headers: { "x-revalidate-secret": secret },
    cache: "no-store",
  }).catch(() => undefined);
}

function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Wrong email or password.";
    case "auth/weak-password":
      return "Password needs at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts — try again shortly.";
    case "auth/invalid-email":
      return "That email address does not look valid.";
    default:
      if (err instanceof Error && err.message) return err.message;
      return "Authentication failed.";
  }
}

async function toAuthResponse(
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
  },
  db: Firestore = firebaseDb(),
): Promise<AuthResponse> {
  let role: string = "visitor";
  try {
    const adminDoc = await getDoc(doc(db, "admins", user.uid));
    if (adminDoc.exists()) role = "admin";
  } catch {
    // Rules may deny this read for non-admin sessions — that's fine, visitor.
  }
  const account: AdminUser = {
    id: user.uid,
    email: user.email ?? "",
    name: user.displayName ?? user.email?.split("@")[0] ?? "Guest",
    role,
  };
  setToken(user.uid);
  setStoredUser(account);
  return { token: user.uid, user: account };
}

async function assertNotAdminOnPublic(user: { uid: string }): Promise<void> {
  try {
    // Use the PUBLIC app's Firestore: the user just signed in via firebaseAuth(),
    // so firebaseDb() carries their auth and the rules allow reading their own
    // admins/{uid} doc. (adminDb() has no session here — the read would be denied
    // and the guard would fail open.)
    const snap = await getDoc(doc(firebaseDb(), "admins", user.uid));
    if (snap.exists()) {
      await fbSignOut(firebaseAuth());
      throw new ApiError(
        "This is an admin account. Sign in at /admin instead.",
        403,
        "forbidden",
      );
    }
  } catch (err) {
    if (err instanceof ApiError) throw err;
    // network error — treat as non-admin and continue
  }
}

type EnquiryRow = Omit<Enquiry, "createdAt"> & { createdAt?: unknown };

function enquiryFromDoc(id: string, data: EnquiryRow): Enquiry {
  const raw = data.createdAt;
  const createdAt =
    raw && typeof raw === "object" && "toDate" in raw && typeof raw.toDate === "function"
      ? raw.toDate().toISOString()
      : typeof raw === "string"
        ? raw
        : new Date(0).toISOString();
  return {
    id,
    name: data.name ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    guide: data.guide ?? "",
    interest: data.interest ?? "",
    message: data.message ?? "",
    status: data.status ?? "new",
    createdAt,
  };
}

export const api = {
  /* ------------------------------------------------------------------ health */

  async health(): Promise<HealthResponse> {
    requireConfigured();
    try {
      await getDocs(query(collection(adminDb(), "properties")));
      return { ok: true, name: "firestore", version: firebaseProjectId, time: new Date().toISOString() };
    } catch (err) {
      throw new OfflineError(err instanceof Error ? err.message : "Firestore unreachable");
    }
  },

  /* -------------------------------------------------------- admin session */

  async login(email: string, password: string): Promise<AuthResponse> {
    requireConfigured();
    try {
      const cred = await signInWithEmailAndPassword(adminAuth(), email.trim(), password);
      const res = await toAuthResponse(cred.user, adminDb());
      if (res.user.role !== "admin") {
        fbSignOut(adminAuth());
        setToken("");
        setStoredUser(null);
        throw new ApiError("This account does not have admin access.", 403, "forbidden");
      }
      return res;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(authErrorMessage(err), 401, "unauthorized");
    }
  },

  async me(): Promise<AdminUser> {
    requireConfigured();
    const u = adminAuth().currentUser;
    if (!u) throw new ApiError("Not signed in.", 401, "unauthorized");
    const res = await toAuthResponse(u, adminDb());
    if (res.user.role !== "admin") {
      throw new ApiError("This account does not have admin access.", 403, "forbidden");
    }
    return res.user;
  },

  /* -------------------------------------------------- admin account creation */

  async adminSignupOpen(): Promise<boolean> {
    try {
      const res = await fetch("/api/admin/register", { cache: "no-store" });
      if (!res.ok) return false;
      const data = (await res.json()) as { open?: boolean };
      return data.open === true;
    } catch {
      return false;
    }
  },

  /** Create a new admin account via the server route (bypasses client Firestore rules). */
  async registerAdmin(email: string, password: string): Promise<void> {
    requireConfigured();
    const res = await fetch("/api/admin/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) throw new ApiError(data.error || "Could not create the admin account.", 400, "validation");
  },

  /* -------------------------------------------------- public visitor accounts */

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    requireConfigured();
    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth(), email.trim(), password);
      await assertNotAdminOnPublic(cred.user);
      await updateProfile(cred.user, { displayName: name.trim() });
      // Persist the visitor profile in the users collection (admin-readable).
      await setDoc(doc(firebaseDb(), "users", cred.user.uid), {
        uid: cred.user.uid,
        name: name.trim(),
        email: email.trim(),
        createdAt: serverTimestamp(),
      });
      return await toAuthResponse({ ...cred.user, displayName: name.trim() });
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(authErrorMessage(err), 400, "validation");
    }
  },

  async listUsers(): Promise<AdminUser[]> {
    requireConfigured();
    const snap = await getDocs(query(collection(adminDb(), "users"), orderBy("createdAt", "desc")));
    return snap.docs.map((d) => {
      const data = d.data() as { uid?: string; name?: string; email?: string; createdAt?: unknown };
      return {
        id: data.uid ?? d.id,
        name: data.name ?? "",
        email: data.email ?? "",
        role: "visitor",
      } satisfies AdminUser;
    });
  },

  async authLogin(email: string, password: string): Promise<AuthResponse> {
    requireConfigured();
    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth(), email.trim(), password);
      await assertNotAdminOnPublic(cred.user);
      return await toAuthResponse(cred.user);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(authErrorMessage(err), 401, "unauthorized");
    }
  },

  async authMe(): Promise<AuthResponse> {
    requireConfigured();
    const u = firebaseAuth().currentUser;
    if (!u) throw new ApiError("Not signed in.", 401, "unauthorized");
    await assertNotAdminOnPublic(u);
    return await toAuthResponse(u);
  },

  async listFavorites(): Promise<string[]> {
    requireConfigured();
    const u = firebaseAuth().currentUser;
    if (!u) return [];
    const snap = await getDoc(doc(firebaseDb(), "favorites", u.uid));
    const slugs = snap.exists() ? (snap.data().slugs as string[] | undefined) : undefined;
    return Array.isArray(slugs) ? slugs : [];
  },

  async addFavorite(slug: string): Promise<string[]> {
    requireConfigured();
    const u = firebaseAuth().currentUser;
    if (!u) throw new ApiError("Sign in to save residences.", 401, "unauthorized");
    const current = await api.listFavorites();
    const next = current.includes(slug) ? current : [...current, slug];
    await setDoc(doc(firebaseDb(), "favorites", u.uid), { slugs: next }, { merge: true });
    return next;
  },

  async removeFavorite(slug: string): Promise<string[]> {
    requireConfigured();
    const u = firebaseAuth().currentUser;
    if (!u) throw new ApiError("Sign in to manage saved residences.", 401, "unauthorized");
    const current = await api.listFavorites();
    const next = current.filter((s) => s !== slug);
    await setDoc(doc(firebaseDb(), "favorites", u.uid), { slugs: next }, { merge: true });
    return next;
  },

  /* -------------------------------------------------------------- catalogue */

  async listProperties(): Promise<Property[]> {
    requireConfigured();
    const snap = await getDocs(collection(adminDb(), "properties"));
    return snap.docs.map((d) => d.data() as Property);
  },

  async createProperty(input: Property): Promise<Property> {
    requireConfigured();
    await setDoc(doc(adminDb(), "properties", input.slug), input);
    pingRevalidate();
    return input;
  },

  async updateProperty(slug: string, patch: Partial<Property>): Promise<Property> {
    requireConfigured();
    await updateDoc(doc(adminDb(), "properties", slug), patch as Record<string, unknown>);
    pingRevalidate();
    const snap = await getDoc(doc(adminDb(), "properties", slug));
    if (!snap.exists()) throw new ApiError("Residence not found.", 404, "not_found");
    return snap.data() as Property;
  },

  async deleteProperty(slug: string): Promise<void> {
    requireConfigured();
    await deleteDoc(doc(adminDb(), "properties", slug));
    pingRevalidate();
  },

  async listAgents(): Promise<Agent[]> {
    requireConfigured();
    const snap = await getDocs(collection(adminDb(), "agents"));
    return snap.docs.map((d) => d.data() as Agent);
  },

  async createAgent(input: Agent): Promise<Agent> {
    requireConfigured();
    await setDoc(doc(adminDb(), "agents", input.slug), input);
    pingRevalidate();
    return input;
  },

  async updateAgent(slug: string, patch: Partial<Agent>): Promise<Agent> {
    requireConfigured();
    await updateDoc(doc(adminDb(), "agents", slug), patch as Record<string, unknown>);
    pingRevalidate();
    const snap = await getDoc(doc(adminDb(), "agents", slug));
    return snap.data() as Agent;
  },

  async deleteAgent(slug: string): Promise<void> {
    requireConfigured();
    await deleteDoc(doc(adminDb(), "agents", slug));
    pingRevalidate();
  },

  async listJournal(): Promise<JournalPost[]> {
    requireConfigured();
    const snap = await getDocs(collection(adminDb(), "journal"));
    return snap.docs.map((d) => d.data() as JournalPost);
  },

  async createJournal(input: JournalPost): Promise<JournalPost> {
    requireConfigured();
    await setDoc(doc(adminDb(), "journal", input.slug), input);
    pingRevalidate();
    return input;
  },

  async updateJournal(slug: string, patch: Partial<JournalPost>): Promise<JournalPost> {
    requireConfigured();
    await updateDoc(doc(adminDb(), "journal", slug), patch as Record<string, unknown>);
    pingRevalidate();
    const snap = await getDoc(doc(adminDb(), "journal", slug));
    return snap.data() as JournalPost;
  },

  async deleteJournal(slug: string): Promise<void> {
    requireConfigured();
    await deleteDoc(doc(adminDb(), "journal", slug));
    pingRevalidate();
  },

  /* -------------------------------------------------------------- enquiries */

  async sendEnquiry(input: EnquiryInput): Promise<{ id?: string } | undefined> {
    requireConfigured();
    const ref = await addDoc(collection(firebaseDb(), "enquiries"), {
      name: input.name,
      email: input.email,
      phone: input.phone ?? "",
      guide: input.guide ?? "",
      interest: input.interest ?? "",
      message: input.message,
      status: input.status ?? "new",
      createdAt: serverTimestamp(),
    });
    return { id: ref.id };
  },

  async listEnquiries(): Promise<Enquiry[]> {
    requireConfigured();
    const snap = await getDocs(query(collection(adminDb(), "enquiries"), orderBy("createdAt", "desc")));
    return snap.docs.map((d) => enquiryFromDoc(d.id, d.data() as EnquiryRow));
  },

  async updateEnquiry(id: string, patch: Partial<Enquiry>): Promise<Enquiry> {
    requireConfigured();
    await updateDoc(doc(adminDb(), "enquiries", id), patch as Record<string, unknown>);
    const snap = await getDoc(doc(adminDb(), "enquiries", id));
    return enquiryFromDoc(snap.id, snap.data() as EnquiryRow);
  },

  async deleteEnquiry(id: string): Promise<void> {
    requireConfigured();
    await deleteDoc(doc(adminDb(), "enquiries", id));
  },

  async upload(file: File): Promise<UploadResponse> {
    void file;
    throw new Error("Image uploads need Firebase Storage — paste an image URL for now.");
  },
};
