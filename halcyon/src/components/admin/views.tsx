"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Agent, EnquiryStatus, JournalPost } from "@/lib/api-types";
import { API_BASE } from "@/lib/api";
import { useAdmin } from "./admin-context";
import {
  ConfirmDialog,
  EmptyState,
  Field,
  IconBtn,
  Modal,
  Pill,
  Thumb,
  fmtDate,
  icons,
  inputCls,
  slugify,
  timeAgo,
} from "./admin-ui";

/* ------------------------------------------------------------------ shared */

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card p-6">
      <p className="text-[0.78rem] text-slate">{label}</p>
      <p className="num display mt-3 text-[2.1rem] leading-none tracking-[-0.03em]">{value}</p>
      {sub && <p className="mt-2.5 text-[0.76rem] leading-relaxed text-fog">{sub}</p>}
    </div>
  );
}

function statusPillTone(s: EnquiryStatus): "blue" | "brass" | "green" {
  return s === "new" ? "blue" : s === "read" ? "brass" : "green";
}

/** 0 → "0"; under 1M → plain number; then M / B / T as the number dictates. */
function formatPortfolio(v: number): string {
  if (!v) return "0";
  const trim = (n: number) => (Math.round(n * 10) / 10).toFixed(1).replace(/\.0$/, "");
  if (v >= 1e12) return `$${trim(v / 1e12)}T`;
  if (v >= 1e9) return `$${trim(v / 1e9)}B`;
  if (v >= 1e6) return `$${trim(v / 1e6)}M`;
  return `$${Math.round(v).toLocaleString("en-US")}`;
}

/* --------------------------------------------------------------- dashboard */

export function DashboardView() {
  const { properties, enquiries, status, configured, user, setTab, openPropertyForm, loading } =
    useAdmin();
  const [today, setToday] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      const now = new Date();
      const h = now.getHours();
      setToday(
        new Intl.DateTimeFormat("en", { weekday: "long", day: "numeric", month: "long" }).format(now),
      );
      setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const byStatus = useMemo(() => {
    const m: Record<string, number> = { "For Sale": 0, "Private Listing": 0, "Under Offer": 0 };
    for (const p of properties) m[p.status] = (m[p.status] ?? 0) + 1;
    return m;
  }, [properties]);

  const newCount = enquiries.filter((e) => e.status === "new").length;
  const recent = enquiries.slice(0, 5);
  const active = properties.filter((p) => p.status !== "Under Offer");
  const portfolioValue = active.reduce((sum, p) => sum + p.price, 0);
  const total = Math.max(properties.length, 1);
  const firstName = (user?.name ?? "there").split(" ")[0];
  const live = configured && status === "connected";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-brass">{today || "Overview"}</p>
          <h2 className="display mt-2 text-[2rem] leading-none tracking-[-0.03em]">
            {greeting ? `${greeting}, ${firstName}` : "Overview"}
          </h2>
          <p className="mt-2.5 max-w-[38rem] text-[0.92rem] leading-relaxed text-slate">
            {configured
              ? `${properties.length} residences under management · ${newCount} new ${
                  newCount === 1 ? "enquiry" : "enquiries"
                } waiting`
              : "No database connected — the portfolio and enquiries will appear here once the backend is live."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => openPropertyForm(null)}
          disabled={!configured}
          title={configured ? undefined : "Connect the database to add residences"}
          className="btn btn-solid disabled:opacity-55"
        >
          Add a residence
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Residences"
          value={loading ? "…" : properties.length}
          sub={`${byStatus["For Sale"] ?? 0} for sale · ${byStatus["Private Listing"] ?? 0} private · ${byStatus["Under Offer"] ?? 0} under offer`}
        />
        <StatCard
          label="Portfolio value"
          value={loading ? "…" : formatPortfolio(portfolioValue)}
          sub={`Guide price across ${active.length} active ${active.length === 1 ? "mandate" : "mandates"}`}
        />
        <StatCard
          label="New enquiries"
          value={newCount}
          sub={`${enquiries.length} total — from the public contact form`}
        />
        <StatCard
          label="Database"
          value={live ? "Live" : status === "degraded" ? "Down" : configured ? "…" : "Off"}
          sub={
            live
              ? "Connected to the API"
              : status === "degraded"
                ? "Backend unreachable — writes will fail"
                : configured
                  ? "Checking the connection…"
                  : "Set NEXT_PUBLIC_API_BASE_URL to connect"
          }
        />
      </div>

      <section className="card p-6 sm:p-7">
        <h3 className="text-[1rem] font-semibold tracking-[-0.012em]">Portfolio mix</h3>
        <div className="mt-5 space-y-4">
          {(["For Sale", "Private Listing", "Under Offer"] as const).map((s) => {
            const n = byStatus[s] ?? 0;
            const pct = Math.round((n / total) * 100);
            return (
              <div key={s} className="flex items-center gap-4">
                <span className="w-[9.5rem] shrink-0 text-[0.84rem] text-slate">{s}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-pill bg-mist">
                  <div
                    className={`h-full rounded-pill transition-[width] duration-500 ${
                      s === "For Sale" ? "bg-ink" : s === "Private Listing" ? "bg-brass" : "bg-signal/70"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="num w-10 text-right text-[0.84rem] text-slate">{n}</span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-rule px-6 py-5">
            <h3 className="text-[1rem] font-semibold tracking-[-0.012em]">Latest enquiries</h3>
            <button
              type="button"
              onClick={() => setTab("enquiries")}
              className="text-[0.82rem] text-slate underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              View all
            </button>
          </div>
          {recent.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No enquiries yet."
                body="Messages sent from the public contact form land here once the database is connected."
              />
            </div>
          ) : (
            <ul>
              {recent.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-rule px-6 py-4 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="text-[0.92rem] font-medium">{e.name}</p>
                    <p className="mt-0.5 truncate text-[0.8rem] text-slate">
                      {e.interest} · {e.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Pill tone={statusPillTone(e.status)}>{e.status}</Pill>
                    <span className="num text-[0.75rem] text-fog">{timeAgo(e.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-6">
          <h3 className="text-[1rem] font-semibold tracking-[-0.012em]">Quick actions</h3>
          <ul className="mt-4 space-y-1">
            {[
              { label: "Add a residence", run: () => openPropertyForm(null), needsDb: true },
              { label: "Review enquiries", run: () => setTab("enquiries"), needsDb: false },
              { label: "Manage agents", run: () => setTab("people"), needsDb: false },
              { label: "Settings", run: () => setTab("settings"), needsDb: false },
            ].map((a) => (
              <li key={a.label}>
                <button
                  type="button"
                  onClick={a.run}
                  disabled={a.needsDb && !configured}
                  title={a.needsDb && !configured ? "Connect the database first" : undefined}
                  className="flex w-full items-center justify-between gap-3 rounded-card px-4 py-3 text-left text-[0.88rem] text-ink transition-colors hover:bg-mist disabled:opacity-45 disabled:hover:bg-transparent"
                >
                  {a.label}
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M3.5 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- enquiries */

export function EnquiriesView() {
  const { enquiries, setEnquiryStatus, deleteEnquiry } = useAdmin();
  const [filter, setFilter] = useState<"all" | EnquiryStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filter === "all" ? enquiries : enquiries.filter((e) => e.status === filter)),
    [enquiries, filter],
  );
  const selected = filtered.find((e) => e.id === selectedId) ?? filtered[0] ?? null;
  const confirming = enquiries.find((e) => e.id === confirmId) ?? null;

  const filters: { id: "all" | EnquiryStatus; label: string }[] = [
    { id: "all", label: "All" },
    { id: "new", label: "New" },
    { id: "read", label: "Read" },
    { id: "handled", label: "Handled" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-pill border px-4 py-2 text-[0.82rem] transition-colors ${
                filter === f.id
                  ? "border-ink bg-ink text-white"
                  : "border-rule bg-paper text-slate hover:border-ink hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="num text-[0.8rem] text-fog">{filtered.length} shown</p>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Nothing here."
            body="Enquiries from the public contact form will land here once the database is connected."
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <ul className="no-bar space-y-2 overflow-y-auto lg:col-span-6 xl:col-span-5">
            {filtered.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(e.id)}
                  className={`w-full rounded-card border px-5 py-4 text-left transition-colors ${
                    selected?.id === e.id ? "border-ink bg-paper" : "border-rule bg-paper hover:border-ink/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-[0.92rem] font-medium">{e.name}</p>
                    <span className="num shrink-0 text-[0.72rem] text-fog">{timeAgo(e.createdAt)}</span>
                  </div>
                  <p className="mt-1 truncate text-[0.8rem] text-slate">{e.email}</p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <Pill tone={statusPillTone(e.status)}>{e.status}</Pill>
                    <Pill tone="neutral">{e.interest}</Pill>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {selected && (
            <div className="card p-6 sm:p-8 lg:col-span-6 xl:col-span-7">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-rule pb-5">
                <div>
                  <h2 className="text-[1.2rem] font-semibold tracking-[-0.018em]">{selected.name}</h2>
                  <p className="mt-1 text-[0.82rem] text-slate">
                    {selected.interest} · Guide: {selected.guide || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Pill tone={statusPillTone(selected.status)}>{selected.status}</Pill>
                </div>
              </div>

              <dl className="mt-5 space-y-2.5 text-[0.85rem]">
                <div className="flex gap-3">
                  <dt className="w-20 shrink-0 text-fog">Email</dt>
                  <dd>
                    <a href={`mailto:${selected.email}`} className="link-chevron">
                      {selected.email}
                    </a>
                  </dd>
                </div>
                {selected.phone && (
                  <div className="flex gap-3">
                    <dt className="w-20 shrink-0 text-fog">Telephone</dt>
                    <dd className="num">{selected.phone}</dd>
                  </div>
                )}
                <div className="flex gap-3">
                  <dt className="w-20 shrink-0 text-fog">Received</dt>
                  <dd className="num">{fmtDate(selected.createdAt)}</dd>
                </div>
              </dl>

              <div className="mt-6 rounded-card bg-mist px-5 py-4">
                <p className="eyebrow text-brass">The brief</p>
                <p className="mt-3 whitespace-pre-wrap text-[0.92rem] leading-relaxed text-ink">
                  {selected.message}
                </p>
              </div>

              <div className="mt-7 flex flex-wrap gap-2 border-t border-rule pt-6">
                {(["new", "read", "handled"] as EnquiryStatus[])
                  .filter((s) => s !== selected.status)
                  .map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void setEnquiryStatus(selected.id, s)}
                      className="btn btn-quiet px-4 py-2 text-[0.82rem]"
                    >
                      Mark {s}
                    </button>
                  ))}
                <button
                  type="button"
                  onClick={() => setConfirmId(selected.id)}
                  className="btn btn-quiet px-4 py-2 text-[0.82rem] text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {confirming && (
        <ConfirmDialog
          title="Delete enquiry?"
          body={`This will permanently remove the enquiry from ${confirming.name} (${confirming.email}).`}
          onConfirm={() => {
            void deleteEnquiry(confirming.id);
            setConfirmId(null);
            setSelectedId(null);
          }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ journal */

export function JournalView() {
  const { journal, saveJournal, deleteJournal } = useAdmin();
  const [editing, setEditing] = useState<JournalPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmSlug, setConfirmSlug] = useState<string | null>(null);
  const confirming = journal.find((j) => j.slug === confirmSlug) ?? null;
  const open = creating || editing !== null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.35rem] font-semibold tracking-[-0.02em]">Journal</h1>
          <p className="mt-1 text-[0.85rem] text-slate">{journal.length} published pieces</p>
        </div>
        <button type="button" onClick={() => setCreating(true)} className="btn btn-solid inline-flex items-center gap-2">
          {icons.plus} Add article
        </button>
      </div>

      {journal.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No articles yet." body="Add perspective, method and research pieces — they appear on /journal and the home page." />
        </div>
      ) : (
        <ul className="mt-8 overflow-hidden rounded-card border border-rule bg-paper">
          {journal.map((post) => (
            <li key={post.slug} className="flex flex-wrap items-center gap-4 border-b border-rule px-5 py-4 last:border-b-0">
              <Thumb src={post.image} alt="" className="size-14 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.95rem] font-medium">{post.title}</p>
                <p className="mt-0.5 text-[0.78rem] text-slate">
                  {post.category} · {post.date} · {post.read}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <IconBtn label="Edit article" onClick={() => setEditing(post)}>
                  {icons.pencil}
                </IconBtn>
                <IconBtn label="Delete article" tone="danger" onClick={() => setConfirmSlug(post.slug)}>
                  {icons.trash}
                </IconBtn>
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <JournalForm
          orig={editing}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSubmit={async (input) => {
            await saveJournal(editing, input);
            setCreating(false);
            setEditing(null);
          }}
        />
      )}

      {confirming && (
        <ConfirmDialog
          title="Delete article?"
          body={`“${confirming.title}” will be removed from the journal.`}
          onConfirm={() => {
            void deleteJournal(confirming.slug);
            setConfirmSlug(null);
          }}
          onCancel={() => setConfirmSlug(null)}
        />
      )}
    </div>
  );
}

function JournalForm({
  orig,
  onCancel,
  onSubmit,
}: {
  orig: JournalPost | null;
  onCancel: () => void;
  onSubmit: (input: JournalPost) => Promise<void>;
}) {
  const { upload, notify } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState(orig?.title ?? "");
  const [slug, setSlug] = useState(orig?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(orig));
  const [category, setCategory] = useState(orig?.category ?? "Perspective");
  const [date, setDate] = useState(orig?.date ?? "");
  const [read, setRead] = useState(orig?.read ?? "5 min");
  const [image, setImage] = useState(orig?.image ?? "");
  const [excerpt, setExcerpt] = useState(orig?.excerpt ?? "");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const finalSlug = slug.trim() || slugify(title);
    if (!title.trim() || !finalSlug || !excerpt.trim()) {
      setError("Title, slug and excerpt are required.");
      return;
    }
    setBusy(true);
    try {
      await onSubmit({
        slug: finalSlug,
        title: title.trim(),
        category: category.trim() || "Perspective",
        date: date.trim(),
        read: read.trim() || "5 min",
        image: image.trim(),
        excerpt: excerpt.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title={orig ? "Edit article" : "New article"}
      subtitle={orig ? `Editing ${orig.slug}` : "Appears on /journal"}
      onClose={onCancel}
    >
      <form onSubmit={submit} className="space-y-5">
        <Field label="Title" required>
          <input className={inputCls} value={title} onChange={(e) => { setTitle(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Slug" required hint="URL identifier">
            <input className={`${inputCls} num`} value={slug} onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }} />
          </Field>
          <Field label="Category">
            <input className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)} />
          </Field>
          <Field label="Date label" hint='e.g. "March 2026"'>
            <input className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Read time" hint='e.g. "8 min"'>
            <input className={inputCls} value={read} onChange={(e) => setRead(e.target.value)} />
          </Field>
        </div>
        <ImageField label="Cover image" value={image} onChange={setImage} upload={upload} notify={notify} />
        <Field label="Excerpt" required>
          <textarea rows={4} className={`${inputCls} resize-none`} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        </Field>
        {error && (
          <p role="alert" className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-[0.82rem] text-red-700">
            {error}
          </p>
        )}
        <div className="flex gap-3 border-t border-rule pt-6">
          <button type="submit" disabled={busy} className="btn btn-solid disabled:opacity-55">
            {busy ? "Saving…" : orig ? "Save changes" : "Create article"}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-quiet">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------- people */

export function PeopleView() {
  const { agents, saveAgent, deleteAgent } = useAdmin();
  const [editing, setEditing] = useState<Agent | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmSlug, setConfirmSlug] = useState<string | null>(null);
  const confirming = agents.find((a) => a.slug === confirmSlug) ?? null;
  const open = creating || editing !== null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.35rem] font-semibold tracking-[-0.02em]">People</h1>
          <p className="mt-1 text-[0.85rem] text-slate">{agents.length} advisors</p>
        </div>
        <button type="button" onClick={() => setCreating(true)} className="btn btn-solid inline-flex items-center gap-2">
          {icons.plus} Add person
        </button>
      </div>

      {agents.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No advisors yet." body="Profiles appear on /agents and are linked to residences via the agent field." />
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((a) => (
            <li key={a.slug} className="card p-5">
              <div className="flex items-start gap-4">
                <Thumb src={a.image} alt="" className="size-16 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.95rem] font-semibold">{a.name}</p>
                  <p className="mt-0.5 truncate text-[0.8rem] text-slate">{a.role}</p>
                  <p className="num mt-1 truncate text-[0.75rem] text-fog">{a.email}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end gap-1 border-t border-rule pt-3">
                <IconBtn label="Edit profile" onClick={() => setEditing(a)}>
                  {icons.pencil}
                </IconBtn>
                <IconBtn label="Delete profile" tone="danger" onClick={() => setConfirmSlug(a.slug)}>
                  {icons.trash}
                </IconBtn>
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <AgentForm
          orig={editing}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSubmit={async (input) => {
            await saveAgent(editing, input);
            setCreating(false);
            setEditing(null);
          }}
        />
      )}

      {confirming && (
        <ConfirmDialog
          title="Delete profile?"
          body={`${confirming.name} will be removed. Residences that reference this agent will simply show no advisor card.`}
          onConfirm={() => {
            void deleteAgent(confirming.slug);
            setConfirmSlug(null);
          }}
          onCancel={() => setConfirmSlug(null)}
        />
      )}
    </div>
  );
}

export function UsersView() {
  const { users } = useAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.35rem] font-semibold tracking-[-0.02em]">Users</h1>
          <p className="mt-1 text-[0.85rem] text-slate">
            {users.length} registered {users.length === 1 ? "account" : "accounts"}
          </p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No registered users yet."
            body="Visitor accounts created on the public site appear here automatically."
          />
        </div>
      ) : (
        <div className="card mt-8 overflow-hidden">
          <table className="w-full text-left text-[0.85rem]">
            <thead>
              <tr className="border-b border-rule bg-mist/40 text-[0.72rem] uppercase tracking-[0.1em] text-slate">
                <th className="px-5 py-3.5 font-medium">Name</th>
                <th className="px-5 py-3.5 font-medium">Email</th>
                <th className="px-5 py-3.5 font-medium">Role</th>
                <th className="px-5 py-3.5 font-medium">UID</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-rule/60 last:border-0">
                  <td className="px-5 py-3.5 font-medium">{u.name || "—"}</td>
                  <td className="px-5 py-3.5 text-slate">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <Pill tone={u.role === "admin" ? "brass" : "blue"}>{u.role ?? "visitor"}</Pill>
                  </td>
                  <td className="num px-5 py-3.5 text-[0.75rem] text-fog">{u.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AgentForm({
  orig,
  onCancel,
  onSubmit,
}: {
  orig: Agent | null;
  onCancel: () => void;
  onSubmit: (input: Agent) => Promise<void>;
}) {
  const { upload, notify } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState(orig?.name ?? "");
  const [slug, setSlug] = useState(orig?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(orig));
  const [role, setRole] = useState(orig?.role ?? "");
  const [image, setImage] = useState(orig?.image ?? "");
  const [phone, setPhone] = useState(orig?.phone ?? "");
  const [email, setEmail] = useState(orig?.email ?? "");
  const [languages, setLanguages] = useState(orig?.languages ?? "");
  const [focus, setFocus] = useState(orig?.focus ?? "");
  const [bio, setBio] = useState(orig?.bio ?? "");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const finalSlug = slug.trim() || slugify(name);
    if (!name.trim() || !finalSlug) {
      setError("Name and slug are required.");
      return;
    }
    setBusy(true);
    try {
      await onSubmit({
        slug: finalSlug,
        name: name.trim(),
        role: role.trim(),
        image: image.trim(),
        phone: phone.trim(),
        email: email.trim(),
        languages: languages.trim(),
        focus: focus.trim(),
        bio: bio.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={orig ? "Edit profile" : "New profile"} onClose={onCancel} wide>
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" required>
            <input className={inputCls} value={name} onChange={(e) => { setName(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }} />
          </Field>
          <Field label="Slug" required>
            <input className={`${inputCls} num`} value={slug} onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }} />
          </Field>
          <Field label="Role" required hint='e.g. "Partner, Europe"'>
            <input className={inputCls} value={role} onChange={(e) => setRole(e.target.value)} />
          </Field>
          <Field label="Focus" hint="Markets / specialisms">
            <input className={inputCls} value={focus} onChange={(e) => setFocus(e.target.value)} />
          </Field>
          <Field label="Email">
            <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Telephone">
            <input className={`${inputCls} num`} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field label="Languages" className="sm:col-span-2">
            <input className={inputCls} value={languages} onChange={(e) => setLanguages(e.target.value)} />
          </Field>
        </div>
        <ImageField label="Portrait" value={image} onChange={setImage} upload={upload} notify={notify} />
        <Field label="Bio" hint="One or two sentences">
          <textarea rows={3} className={`${inputCls} resize-none`} value={bio} onChange={(e) => setBio(e.target.value)} />
        </Field>
        {error && (
          <p role="alert" className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-[0.82rem] text-red-700">
            {error}
          </p>
        )}
        <div className="flex gap-3 border-t border-rule pt-6">
          <button type="submit" disabled={busy} className="btn btn-solid disabled:opacity-55">
            {busy ? "Saving…" : orig ? "Save changes" : "Create profile"}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-quiet">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ----------------------------------------------------------------- settings */

export function SettingsView() {
  const { configured, status, user, token, login, logout, refresh } = useAdmin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submitLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card p-6 sm:p-8">
        <h2 className="text-[1.05rem] font-semibold tracking-[-0.015em]">Database</h2>
        <dl className="mt-5 space-y-3 text-[0.85rem]">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-slate">API base URL</dt>
            <dd className="num truncate text-ink">{configured ? API_BASE : "Not configured"}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-slate">Status</dt>
            <dd>
              <Pill tone={status === "connected" ? "green" : status === "degraded" ? "amber" : "neutral"}>
                {status === "connected" ? "Connected" : status === "degraded" ? "Unreachable" : !configured ? "No database" : "Checking…"}
              </Pill>
            </dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={() => void refresh()} className="btn btn-quiet px-4 py-2 text-[0.82rem]">
            Re-check connection
          </button>
        </div>
        <p className="mt-5 text-[0.75rem] leading-relaxed text-fog">
          The base URL comes from <span className="num">NEXT_PUBLIC_API_BASE_URL</span> at build time.
          All data — residences, enquiries, visitor accounts and favourites — lives in that database.
          Nothing is stored in this browser.
        </p>
      </section>

      <section className="card p-6 sm:p-8">
        <h2 className="text-[1.05rem] font-semibold tracking-[-0.015em]">Session</h2>
        {user || token ? (
          <div className="mt-5 space-y-3 text-[0.88rem]">
            <p>
              Signed in as <strong className="font-semibold">{user?.name ?? "administrator"}</strong>
              {user?.email && <span className="text-slate"> · {user.email}</span>}
            </p>
            <p className="text-[0.78rem] text-fog">
              Token · <span className="num">{token.slice(0, 12)}…</span>
            </p>
            <button type="button" onClick={logout} className="btn btn-quiet mt-2 px-4 py-2 text-[0.82rem]">
              Sign out
            </button>
          </div>
        ) : (
          <form onSubmit={submitLogin} className="mt-5 space-y-4">
            <p className="text-[0.85rem] leading-relaxed text-slate">
              {configured
                ? "Sign in to manage residences, journal, people and enquiries."
                : "No database connected — sign-in becomes available once the backend is live."}
            </p>
            <input
              type="email"
              required
              placeholder="Email"
              disabled={!configured}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
            <input
              type="password"
              required
              placeholder="Password"
              disabled={!configured}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
            />
            {error && (
              <p role="alert" className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-[0.82rem] text-red-700">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy || !configured}
              className="btn btn-solid px-5 py-2.5 text-[0.85rem] disabled:opacity-55"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        )}
      </section>

      <section className="card p-6 sm:p-8 lg:col-span-2">
        <h2 className="text-[1.05rem] font-semibold tracking-[-0.015em]">Accounts &amp; data</h2>
        <p className="mt-3 max-w-[52rem] text-[0.85rem] leading-relaxed text-slate">
          Visitor accounts, favourites and every admin change are stored in the database through the
          API — never in this browser. Until the backend is connected this console is read-only and
          empty, account creation is disabled, and the public contact form cannot send.
        </p>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------- image field */

export function ImageField({
  label,
  value,
  onChange,
  upload,
  notify,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  upload: (file: File) => Promise<string>;
  notify: (kind: "ok" | "error" | "info", msg: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const url = await upload(file);
      onChange(url);
      notify("ok", "Image uploaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Field label={label} hint="URL of an existing image, or upload a file once the backend is live">
      <div className="flex flex-wrap items-center gap-3">
        <input
          className={`${inputCls} num flex-1`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/media/p1.jpg or https://…"
        />
        <label className="btn btn-quiet inline-flex cursor-pointer items-center gap-2 px-4 py-2.5 text-[0.82rem]">
          {icons.upload}
          {busy ? "Uploading…" : "Upload"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              void handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
        {value && <Thumb src={value} alt="" className="h-12 w-16 border border-rule" />}
      </div>
      {error && <p className="mt-2 text-[0.78rem] text-red-700">{error}</p>}
    </Field>
  );
}

/* ------------------------------------------------------------- image field */
