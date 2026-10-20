"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged, signOut as fbSignOut } from "firebase/auth";
import { ApiError, OfflineError, api, apiConfigured, setToken } from "@/lib/api";
import { firebaseAuth, firebaseConfigured } from "@/lib/firebase";
import type { AdminUser } from "@/lib/api-types";

export type AuthMode = "signup" | "signin";

type AuthCtx = {
  /** False until NEXT_PUBLIC_API_BASE_URL points at a database-backed API. */
  configured: boolean;
  user: AdminUser | null;
  favorites: string[];
  isFavorite: (slug: string) => boolean;
  /** Returns false when signed out (the auth modal opens instead). */
  toggleFavorite: (slug: string) => boolean;
  authOpen: boolean;
  authMode: AuthMode;
  openAuth: (mode?: AuthMode, pendingSlug?: string) => void;
  closeAuth: () => void;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

function friendly(err: unknown, fallback: string): string {
  if (err instanceof OfflineError) return "The database is not reachable right now — try again shortly.";
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const pendingRef = useRef<string | null>(null);

  // Firebase Auth owns the session (its own secure persistence) — restore it
  // on reload; nothing is written to localStorage by this app.
  useEffect(() => {
    if (!firebaseConfigured) return;
    return onAuthStateChanged(firebaseAuth(), (u) => {
      if (u) {
        const account: AdminUser = {
          id: u.uid,
          email: u.email ?? "",
          name: u.displayName ?? u.email?.split("@")[0] ?? "Guest",
        };
        setToken(u.uid);
        setUser(account);
        api
          .listFavorites()
          .then(setFavorites)
          .catch(() => setFavorites([]));
      } else {
        setToken("");
        setUser(null);
        setFavorites([]);
      }
    });
  }, []);

  const openAuth = useCallback((mode: AuthMode = "signup", slug?: string) => {
    setAuthMode(mode);
    pendingRef.current = slug ?? null;
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setAuthOpen(false);
    pendingRef.current = null;
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    if (!apiConfigured) {
      throw new Error("Accounts open once the database is connected. Nothing can be created yet.");
    }
    try {
      await api.register(name, email, password);
    } catch (err) {
      throw new Error(friendly(err, "Account creation failed."));
    }
    // The modal slides over to sign-in; nothing is auto-signed.
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!apiConfigured) {
      throw new Error("Accounts open once the database is connected. Nothing can be signed in yet.");
    }
    let token: string;
    let account: AdminUser;
    try {
      const res = await api.authLogin(email, password);
      token = res.token;
      account = res.user;
    } catch (err) {
      throw new Error(friendly(err, "Sign-in failed."));
    }
    setToken(token);
    setUser(account);
    let slugs: string[] = [];
    try {
      slugs = await api.listFavorites();
    } catch {
      slugs = [];
    }
    if (pendingRef.current && !slugs.includes(pendingRef.current)) {
      const pending = pendingRef.current;
      try {
        slugs = await api.addFavorite(pending);
      } catch {
        /* favourite will simply not be applied */
      }
      pendingRef.current = null;
    }
    setFavorites(slugs);
    setAuthOpen(false);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fbSignOut(firebaseAuth());
    } catch {
      /* ignore */
    }
    setToken("");
    setUser(null);
    setFavorites([]);
  }, []);

  const toggleFavorite = useCallback(
    (slug: string): boolean => {
      if (!user) {
        openAuth("signup", slug);
        return false;
      }
      const adding = !favorites.includes(slug);
      const next = adding ? [...favorites, slug] : favorites.filter((s) => s !== slug);
      setFavorites(next);
      if (apiConfigured) {
        const req = adding ? api.addFavorite(slug) : api.removeFavorite(slug);
        void req
          .then((slugs) => {
            if (Array.isArray(slugs)) setFavorites(slugs);
          })
          .catch(() => {
            /* revert the optimistic flip */
            setFavorites(favorites);
          });
      }
      return adding;
    },
    [favorites, openAuth, user],
  );

  const isFavorite = useCallback((slug: string) => favorites.includes(slug), [favorites]);

  const value = useMemo<AuthCtx>(
    () => ({
      configured: apiConfigured,
      user,
      favorites,
      isFavorite,
      toggleFavorite,
      authOpen,
      authMode,
      openAuth,
      closeAuth,
      signUp,
      signIn,
      signOut,
    }),
    [user, favorites, isFavorite, toggleFavorite, authOpen, authMode, openAuth, closeAuth, signUp, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
