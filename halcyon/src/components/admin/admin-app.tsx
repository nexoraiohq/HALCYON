"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { signOut as fbSignOut } from "firebase/auth";
import { API_BASE, ApiError, OfflineError, api, apiConfigured, getToken, setStoredUser, setToken } from "@/lib/api";
import { adminAuth, firebaseConfigured } from "@/lib/firebase";
import type { Agent, AdminUser, Enquiry, EnquiryStatus, JournalPost, Property } from "@/lib/api-types";
import {
  AdminContext,
  type AdminCtx,
  type ApiStatus,
  type Tab,
  type Toast,
} from "./admin-context";
import { Banner, StatusDot, inputCls } from "./admin-ui";
import PropertiesView, { PropertyForm } from "./properties";
import { DashboardView, EnquiriesView, JournalView, PeopleView, SettingsView, UsersView } from "./views";

const TABS: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "properties", label: "Residences" },
  { id: "enquiries", label: "Enquiries" },
  { id: "journal", label: "Journal" },
  { id: "people", label: "People" },
  { id: "users", label: "Users" },
  { id: "settings", label: "Settings" },
];

const NAV_ICONS: Record<Tab, ReactNode> = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  properties: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M2.5 14V6.2L8 2.5l5.5 3.7V14H9.8V9.5H6.2V14H2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  enquiries: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2" y="3.5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.5 4.5L8 8.5l5.5-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  journal: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 3.5C6.8 2.6 5.2 2.3 3 2.5v10c2.2-.2 3.8.1 5 1 1.2-.9 2.8-1.2 5-1v-10c-2.2-.2-3.8.1-5 1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8 3.5v11" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  people: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="6" cy="5.5" r="2.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.2 13c.4-2 1.9-3.2 3.8-3.2S9.4 11 9.8 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="11.5" cy="6" r="1.8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M11 9.9c1.6.1 2.6 1.2 2.9 3.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  users: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 13.5c.5-2.5 2.4-4 5-4s4.5 1.5 5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="5.5" cy="4.5" r="1.4" fill="currentColor" />
      <circle cx="10" cy="8" r="1.4" fill="currentColor" />
      <circle cx="6.5" cy="11.5" r="1.4" fill="currentColor" />
    </svg>
  ),
};

type Base = {
  properties: Property[];
  journal: JournalPost[];
  agents: Agent[];
  enquiries: Enquiry[];
  users: AdminUser[];
};

/** No seed data — the database is the only source of truth. */
const EMPTY_BASE: Base = { properties: [], journal: [], agents: [], enquiries: [], users: [] };

type MutationResult = "saved" | "error";

export default function AdminApp() {
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ApiStatus>("checking");
  const [token, setTokenState] = useState("");
  const [user, setUser] = useState<AdminUser | null>(null);
  const [base, setBase] = useState<Base>(EMPTY_BASE);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [propertyFormOpen, setPropertyFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const baseRef = useRef<Base>(EMPTY_BASE);

  useEffect(() => {
    baseRef.current = base;
  });

  const notify = useCallback((kind: Toast["kind"], msg: string) => {
    setToast({ kind, msg, id: Date.now() });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5200);
  }, []);

  const refresh = useCallback(async (opts?: { silent?: boolean }) => {
    if (!apiConfigured) {
      setBase(EMPTY_BASE);
      setStatus("local");
      setLoading(false);
      return;
    }
    if (!opts?.silent) setLoading(true);
    try {
      await api.health();
      setStatus("connected");
    } catch {
      setStatus("degraded");
    }
    const [p, j, a, e, u] = await Promise.allSettled([
      api.listProperties(),
      api.listJournal(),
      api.listAgents(),
      getToken() ? api.listEnquiries() : Promise.resolve([] as Enquiry[]),
      getToken() ? api.listUsers() : Promise.resolve([] as AdminUser[]),
    ]);
    setBase({
      properties: p.status === "fulfilled" ? p.value : [],
      journal: j.status === "fulfilled" ? j.value : [],
      agents: a.status === "fulfilled" ? a.value : [],
      enquiries: e.status === "fulfilled" ? e.value : [],
      users: u.status === "fulfilled" ? u.value : [],
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!firebaseConfigured) {
      const id = window.setTimeout(() => {
        setHydrated(true);
        void refresh();
      }, 0);
      return () => window.clearTimeout(id);
    }
    // Firebase Auth restores the admin session on reload (its own secure
    // persistence). The admin console uses an isolated auth instance so its
    // session never leaks to the public site. Non-admins are signed out.
    let cancelled = false;
    const unsub = adminAuth().onAuthStateChanged((u) => {
      if (cancelled) return;
      if (u) {
        void api
          .me()
          .then((me) => {
            if (cancelled) return;
            setTokenState(me.id);
            setUser(me);
          })
          .catch(async () => {
            if (cancelled) return;
            setTokenState("");
            setUser(null);
            try {
              await fbSignOut(adminAuth());
            } catch {
              /* ignore */
            }
          });
      } else {
        setTokenState("");
        setUser(null);
      }
      setHydrated(true);
      void refresh();
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [refresh]);

  /**
   * Optimistic mutation: apply the local change instantly, fire the network
   * request in the background, and revert + notify on failure. No full
   * re-fetch — only the touched collection is patched.
   */
  const runMutation = useCallback(
    async <K extends keyof Base>(
      collection: K,
      apply: (prev: Base[K]) => Base[K],
      remote: () => Promise<unknown>,
      savedMsg = "Saved.",
    ): Promise<MutationResult> => {
      if (!apiConfigured) {
        notify("error", "No database connected — nothing was saved.");
        return "error";
      }
      const snapshot = baseRef.current[collection];
      // 1. instant UI update
      setBase((prev) => ({ ...prev, [collection]: apply(prev[collection]) }));
      try {
        // 2. background write
        await remote();
        notify("ok", savedMsg);
        return "saved";
      } catch (err) {
        // 3. revert on failure
        setBase((prev) => ({ ...prev, [collection]: snapshot }));
        if (err instanceof OfflineError) {
          notify("error", "Backend unreachable — change reverted.");
        } else {
          notify("error", err instanceof ApiError ? err.message : "Something went wrong — change reverted.");
        }
        return "error";
      }
    },
    [notify],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      if (!apiConfigured) throw new Error("No database connected — sign-in is unavailable.");
      try {
        const r = await api.login(email, password);
        setTokenState(r.token);
        setUser(r.user ?? null);
        notify("ok", `Signed in as ${r.user?.name ?? email}.`);
        await refresh();
      } catch (err) {
        if (err instanceof ApiError) throw new Error(err.message);
        if (err instanceof OfflineError) throw new Error("Backend unreachable — try again once it is live.");
        throw new Error("Sign-in failed.");
      }
    },
    [notify, refresh],
  );

  const logout = useCallback(async () => {
    try {
      await fbSignOut(adminAuth());
    } catch {
      /* ignore */
    }
    setToken("");
    setStoredUser(null);
    setTokenState("");
    setUser(null);
    notify("info", "Signed out.");
  }, [notify]);

  const { properties, journal, agents, enquiries, users } = base;

  const saveProperty = useCallback(
    async (orig: Property | null, input: Property) => {
      const res = await runMutation(
        "properties",
        (prev) =>
          orig
            ? prev.map((p) => (p.slug === orig.slug ? input : p))
            : [...prev, input],
        orig ? () => api.updateProperty(orig.slug, input) : () => api.createProperty(input),
        orig ? "Residence updated." : "Residence created.",
      );
      if (res === "saved") {
        setPropertyFormOpen(false);
        setEditingProperty(null);
      }
    },
    [runMutation],
  );

  const deleteProperty = useCallback(
    async (slug: string) => {
      await runMutation(
        "properties",
        (prev) => prev.filter((p) => p.slug !== slug),
        () => api.deleteProperty(slug),
        "Residence removed.",
      );
    },
    [runMutation],
  );

  const saveJournal = useCallback(
    async (orig: JournalPost | null, input: JournalPost) => {
      await runMutation(
        "journal",
        (prev) =>
          orig
            ? prev.map((j) => (j.slug === orig.slug ? input : j))
            : [...prev, input],
        orig ? () => api.updateJournal(orig.slug, input) : () => api.createJournal(input),
        orig ? "Article updated." : "Article created.",
      );
    },
    [runMutation],
  );

  const deleteJournal = useCallback(
    async (slug: string) => {
      await runMutation(
        "journal",
        (prev) => prev.filter((j) => j.slug !== slug),
        () => api.deleteJournal(slug),
        "Article removed.",
      );
    },
    [runMutation],
  );

  const saveAgent = useCallback(
    async (orig: Agent | null, input: Agent) => {
      await runMutation(
        "agents",
        (prev) =>
          orig
            ? prev.map((a) => (a.slug === orig.slug ? input : a))
            : [...prev, input],
        orig ? () => api.updateAgent(orig.slug, input) : () => api.createAgent(input),
        orig ? "Profile updated." : "Profile created.",
      );
    },
    [runMutation],
  );

  const deleteAgent = useCallback(
    async (slug: string) => {
      await runMutation(
        "agents",
        (prev) => prev.filter((a) => a.slug !== slug),
        () => api.deleteAgent(slug),
        "Profile removed.",
      );
    },
    [runMutation],
  );

  const setEnquiryStatus = useCallback(
    async (id: string, next: EnquiryStatus) => {
      await runMutation(
        "enquiries",
        (prev) => prev.map((e) => (e.id === id ? { ...e, status: next } : e)),
        () => api.updateEnquiry(id, { status: next }),
        "Enquiry updated.",
      );
    },
    [runMutation],
  );

  const deleteEnquiry = useCallback(
    async (id: string) => {
      await runMutation(
        "enquiries",
        (prev) => prev.filter((e) => e.id !== id),
        () => api.deleteEnquiry(id),
        "Enquiry deleted.",
      );
    },
    [runMutation],
  );

  const upload = useCallback(
    async (file: File): Promise<string> => {
      if (!apiConfigured) throw new Error("No database connected — paste an image URL instead.");
      try {
        const res = await api.upload(file);
        if (!res?.url) throw new Error("Upload failed — no URL returned.");
        return res.url;
      } catch (err) {
        if (err instanceof OfflineError) throw new Error("Backend unreachable — paste an image URL instead.");
        if (err instanceof ApiError && err.status === 401) throw new Error("Sign in to upload images.");
        throw new Error(err instanceof Error ? err.message : "Upload failed.");
      }
    },
    [],
  );

  const openPropertyForm = useCallback((p?: Property | null) => {
    setEditingProperty(p ?? null);
    setPropertyFormOpen(true);
  }, []);

  const closePropertyForm = useCallback(() => {
    setPropertyFormOpen(false);
    setEditingProperty(null);
  }, []);

  const ctx: AdminCtx = useMemo(
    () => ({
      hydrated,
      configured: apiConfigured,
      status,
      user,
      token,
      tab,
      setTab,
      loading,
      properties,
      journal,
      agents,
      enquiries,
      users,
      toast,
      notify,
      refresh,
      login,
      logout,
      saveProperty,
      deleteProperty,
      saveJournal,
      deleteJournal,
      saveAgent,
      deleteAgent,
      setEnquiryStatus,
      deleteEnquiry,
      upload,
      propertyFormOpen,
      editingProperty,
      openPropertyForm,
      closePropertyForm,
    }),
    [
      hydrated,
      status,
      user,
      token,
      tab,
      loading,
      properties,
      journal,
      agents,
      enquiries,
      users,
      toast,
      notify,
      refresh,
      login,
      logout,
      saveProperty,
      deleteProperty,
      saveJournal,
      deleteJournal,
      saveAgent,
      deleteAgent,
      setEnquiryStatus,
      deleteEnquiry,
      upload,
      propertyFormOpen,
      editingProperty,
      openPropertyForm,
      closePropertyForm,
    ],
  );

  if (!hydrated) return <BootScreen />;

  // The sign-in gate only appears once a database exists to authenticate against.
  if (apiConfigured && !token) {
    return <SignIn status={status} onLogin={login} onRegister={(email, password) => api.registerAdmin(email, password)} />;
  }

  const newEnquiries = enquiries.filter((e) => e.status === "new").length;
  const currentTab = TABS.find((t) => t.id === tab);

  return (
    <AdminContext.Provider value={ctx}>
      <div className="min-h-screen bg-mist">
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-ink text-white transition-transform duration-300 ease-out lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-[1.1rem]">
            <div>
              <p className="text-[0.95rem] font-semibold tracking-[-0.01em]">HALCYON</p>
              <p className="mt-1 text-[0.6rem] font-medium uppercase tracking-[0.24em] text-brass">
                Management
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
              className="rounded-full p-2 text-white/50 transition-colors hover:text-white lg:hidden"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Management sections">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTab(t.id);
                  setSidebarOpen(false);
                }}
                aria-current={tab === t.id ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-card px-3.5 py-2.5 text-left text-[0.86rem] tracking-[-0.006em] transition-colors ${
                  tab === t.id
                    ? "bg-white/10 font-medium text-white"
                    : "text-white/55 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={tab === t.id ? "text-brass" : "text-white/40"}>{NAV_ICONS[t.id]}</span>
                {t.label}
                {t.id === "enquiries" && newEnquiries > 0 && (
                  <span className="num ml-auto rounded-pill bg-signal px-1.5 py-0.5 text-[0.66rem] font-semibold text-white">
                    {newEnquiries}
                  </span>
                )}
                {t.id === "properties" && (
                  <span className="num ml-auto text-[0.72rem] text-white/40">{properties.length}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="space-y-3 border-t border-white/10 px-5 py-4">
            <StatusPill status={status} />
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 truncate text-[0.78rem] text-white/55">
                {user?.name ?? (apiConfigured ? "Signed out" : "No database")}
              </p>
              {token && (
                <button
                  type="button"
                  onClick={logout}
                  className="shrink-0 text-[0.78rem] text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  Sign out
                </button>
              )}
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col lg:pl-64">
          <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-rule bg-paper/95 px-5 backdrop-blur lg:px-8">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className="rounded-full p-2 text-slate transition-colors hover:bg-mist hover:text-ink lg:hidden"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <h1 className="text-[1.02rem] font-semibold tracking-[-0.015em]">{currentTab?.label}</h1>
          </header>

          <main className="mx-auto w-full max-w-[78rem] flex-1 px-5 py-8 lg:px-8">
            {!apiConfigured && (
              <div className="mb-8">
                <Banner
                  tone="info"
                  action={
                    <button type="button" onClick={() => setTab("settings")} className="btn btn-quiet px-4 py-2 text-[0.8rem]">
                      Settings
                    </button>
                  }
                >
                  <strong className="font-semibold">No database connected.</strong> This console reads
                  and writes only through the backend — it stays empty until{" "}
                  <span className="num">NEXT_PUBLIC_API_BASE_URL</span> points at one. Nothing is
                  stored in this browser.
                </Banner>
              </div>
            )}
            {apiConfigured && status === "degraded" && (
              <div className="mb-8">
                <Banner tone="warn">
                  <strong className="font-semibold">Backend unreachable.</strong> Showing the last data
                  loaded from the database. New changes cannot be saved until the connection returns.
                </Banner>
              </div>
            )}

            {tab === "dashboard" && <DashboardView />}
            {tab === "properties" && <PropertiesView />}
            {tab === "enquiries" && <EnquiriesView />}
            {tab === "journal" && <JournalView />}
            {tab === "people" && <PeopleView />}
            {tab === "users" && <UsersView />}
            {tab === "settings" && <SettingsView />}
          </main>
        </div>

        {propertyFormOpen && <PropertyForm />}

        {toast && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-6 right-6 z-[110] max-w-[22rem] rounded-card border border-rule bg-paper px-5 py-4 text-[0.88rem] leading-relaxed shadow-xl"
          >
            <span
              className={
                toast.kind === "error" ? "text-red-700" : toast.kind === "ok" ? "text-ink" : "text-slate"
              }
            >
              {toast.msg}
            </span>
          </div>
        )}
      </div>
    </AdminContext.Provider>
  );
}

function StatusPill({ status }: { status: ApiStatus }) {
  const base = "inline-flex items-center gap-1.5 rounded-pill bg-white/10 px-2.5 py-1 text-[0.7rem] font-medium text-white";
  if (status === "local") {
    return (
      <span className={base}>
        <StatusDot tone="fog" /> No database
      </span>
    );
  }
  if (status === "connected") {
    return (
      <span className={base}>
        <StatusDot tone="green" /> Database live
      </span>
    );
  }
  if (status === "degraded") {
    return (
      <span className={base}>
        <StatusDot tone="amber" /> API down
      </span>
    );
  }
  return (
    <span className={base}>
      <StatusDot tone="fog" /> Checking…
    </span>
  );
}

function BootScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-mist">
      <div className="text-center">
        <p className="eyebrow text-brass">Halcyon</p>
        <p className="display mt-4 text-title">Management</p>
        <p className="mt-4 text-[0.85rem] text-fog">Loading…</p>
      </div>
    </div>
  );
}

function SignIn({ status, onLogin, onRegister }: { status: ApiStatus; onLogin: (email: string, password: string) => Promise<void>; onRegister: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (mode === "signin") {
        await onLogin(email.trim(), password);
      } else {
        await onRegister(email.trim(), password);
        setNotice("Account created. Sign in to continue.");
        setMode("signin");
        setPassword("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-5">
      <div className="w-full max-w-[24.5rem]">
        <div className="mb-8 text-center">
          <p className="eyebrow text-brass">Halcyon</p>
          <h1 className="display mt-4 text-title">Management</h1>
        </div>
        <form onSubmit={submit} className="card space-y-5 p-8">
          <div>
            <label htmlFor="admin-email" className="text-[0.82rem] font-medium text-ink">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputCls} mt-2`}
              placeholder="you@halcyon.estate"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="text-[0.82rem] font-medium text-ink">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputCls} mt-2`}
              placeholder="••••••••"
            />
          </div>
          {notice && (
            <p className="rounded-card border border-emerald-600/25 bg-emerald-600/5 px-4 py-3 text-[0.82rem] leading-relaxed text-emerald-800">
              {notice}
            </p>
          )}
          {error && (
            <p role="alert" className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-[0.82rem] text-red-700">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy} className="btn btn-solid w-full disabled:opacity-55">
            {busy ? (mode === "signin" ? "Signing in…" : "Creating…") : mode === "signin" ? "Sign in" : "Create account"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
            }}
            className="btn btn-quiet w-full disabled:opacity-55"
          >
            {mode === "signin" ? "Create an account" : "Back to sign in"}
          </button>
          <p className="text-center text-[0.72rem] leading-relaxed text-fog">
            <>
              API · <span className="num">{API_BASE}</span>
              {status === "degraded" && " — unreachable"}
            </>
          </p>
        </form>
      </div>
    </div>
  );
}
