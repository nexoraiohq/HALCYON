"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { Property, PropertyStatus } from "@/lib/api-types";
import { PROPERTY_STATUSES } from "@/lib/api-types";
import { formatPrice } from "@/components/property-card";
import { useAdmin } from "./admin-context";
import {
  ConfirmDialog,
  EmptyState,
  Field,
  IconBtn,
  Modal,
  Thumb,
  icons,
  inputCls,
  slugify,
} from "./admin-ui";
import { ImageField } from "./views";

export default function PropertiesView() {
  const { properties, saveProperty, deleteProperty, openPropertyForm, configured } = useAdmin();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PropertyStatus>("all");
  const [confirmSlug, setConfirmSlug] = useState<string | null>(null);
  const confirming = properties.find((p) => p.slug === confirmSlug) ?? null;

  const regions = useMemo(
    () => Array.from(new Set(properties.map((p) => p.region))).sort(),
    [properties],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return properties.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      );
    });
  }, [properties, query, statusFilter]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.35rem] font-semibold tracking-[-0.02em]">Residences</h1>
          <p className="mt-1 text-[0.85rem] text-slate">
            {properties.length} on file · {regions.length} regions
          </p>
        </div>
        <button
          type="button"
          onClick={() => openPropertyForm(null)}
          disabled={!configured}
          title={configured ? undefined : "Connect the database to add residences"}
          className="btn btn-solid inline-flex items-center gap-2 disabled:opacity-55"
        >
          {icons.plus} Add residence
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, place, region…"
          className={`${inputCls} max-w-[20rem] flex-1`}
        />
        <div className="flex flex-wrap gap-2">
          {(["all", ...PROPERTY_STATUSES] as const).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={statusFilter === s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-pill border px-4 py-2 text-[0.82rem] transition-colors ${
                statusFilter === s
                  ? "border-ink bg-ink text-white"
                  : "border-rule bg-paper text-slate hover:border-ink hover:text-ink"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={configured ? "Nothing matches." : "No database connected."}
            body={
              configured
                ? "Adjust the search or add a new residence — created ones appear on /properties immediately."
                : "Residences live in the database. Set NEXT_PUBLIC_API_BASE_URL and the list loads from the backend — nothing is stored in this browser."
            }
            action={
              configured ? (
                <button type="button" onClick={() => openPropertyForm(null)} className="btn btn-solid">
                  Add residence
                </button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-card border border-rule bg-paper">
          <div className="hidden grid-cols-[minmax(0,1fr)_5.5rem_9.5rem_2.75rem_5.5rem] items-center gap-3 border-b border-rule bg-mist px-5 py-3 text-[0.66rem] font-medium uppercase tracking-[0.14em] text-fog sm:grid">
            <span>Residence</span>
            <span className="text-right">Guide</span>
            <span>Status</span>
            <span className="text-center">Feature</span>
            <span className="text-right">Actions</span>
          </div>
          <ul>
            {filtered.map((p) => (
              <li
                key={p.slug}
                className="grid grid-cols-1 items-center gap-3 border-b border-rule px-4 py-3.5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_5.5rem_9.5rem_2.75rem_5.5rem] sm:px-5"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <Thumb src={p.image} alt="" className="h-14 w-20 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-[0.95rem] font-medium">{p.title}</p>
                      {p.featured && (
                        <span className="text-brass" title="Featured on the home page">
                          {icons.star(true)}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-[0.8rem] text-slate">
                      {p.location} · {p.region}
                    </p>
                  </div>
                </div>
                <p className="num text-[0.9rem] font-semibold tracking-[-0.01em] sm:text-right">
                  {formatPrice(p.price)}
                </p>
                <select
                  aria-label={`Status of ${p.title}`}
                  value={p.status}
                  onChange={(e) => void saveProperty(p, { ...p, status: e.target.value as PropertyStatus })}
                  className="w-full rounded-pill border border-rule bg-paper px-3 py-1.5 text-[0.78rem] text-ink transition-colors focus:border-ink focus:outline-none sm:w-auto"
                >
                  {PROPERTY_STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <button
                  type="button"
                  aria-label={p.featured ? "Remove from featured" : "Mark as featured"}
                  aria-pressed={Boolean(p.featured)}
                  title={p.featured ? "Featured — click to remove" : "Feature on the home page"}
                  onClick={() => void saveProperty(p, { ...p, featured: !p.featured })}
                  className={`mx-auto rounded-full p-2 transition-colors ${
                    p.featured ? "text-brass" : "text-fog hover:text-ink"
                  }`}
                >
                  {icons.star(Boolean(p.featured))}
                </button>
                <div className="flex items-center gap-1 sm:justify-end">
                  <IconBtn label={`Edit ${p.title}`} onClick={() => openPropertyForm(p)}>
                    {icons.pencil}
                  </IconBtn>
                  <IconBtn label={`Delete ${p.title}`} tone="danger" onClick={() => setConfirmSlug(p.slug)}>
                    {icons.trash}
                  </IconBtn>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {confirming && (
        <ConfirmDialog
          title="Delete residence?"
          body={`“${confirming.title}” (${confirming.location}) will be removed from the site. This cannot be undone from the console.`}
          onConfirm={() => {
            void deleteProperty(confirming.slug);
            setConfirmSlug(null);
          }}
          onCancel={() => setConfirmSlug(null)}
        />
      )}
    </div>
  );
}

export function PropertyForm() {
  const { saveProperty, upload, notify, editingProperty: orig, properties, agents, closePropertyForm: onCancel } =
    useAdmin();
  const agentOptions = agents.map((a) => ({ slug: a.slug, label: `${a.name} — ${a.role}` }));
  const existingSlugs = properties.map((p) => p.slug);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(orig?.title ?? "");
  const [slug, setSlug] = useState(orig?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(orig));
  const [location, setLocation] = useState(orig?.location ?? "");
  const [region, setRegion] = useState(orig?.region ?? "");
  const [price, setPrice] = useState(orig ? String(orig.price) : "");
  const [beds, setBeds] = useState(String(orig?.beds ?? 3));
  const [baths, setBaths] = useState(String(orig?.baths ?? 3));
  const [area, setArea] = useState(orig ? String(orig.area) : "");
  const [lot, setLot] = useState(orig?.lot ?? "");
  const [status, setStatus] = useState<PropertyStatus>(orig?.status ?? "For Sale");
  const [type, setType] = useState(orig?.type ?? "");
  const [year, setYear] = useState(orig ? String(orig.year) : String(new Date().getFullYear()));
  const [featured, setFeatured] = useState(Boolean(orig?.featured));
  const [agent, setAgent] = useState(orig?.agent ?? "");
  const [image, setImage] = useState(orig?.image ?? "");
  const [gallery, setGallery] = useState<string[]>(orig?.gallery ?? []);
  const [blurb, setBlurb] = useState(orig?.blurb ?? "");
  const [description, setDescription] = useState(orig?.description.join("\n\n") ?? "");
  const [features, setFeatures] = useState(orig?.features.join("\n") ?? "");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const finalSlug = slug.trim() || slugify(title);
    const priceNum = Number(price);
    const areaNum = Number(area);
    const yearNum = Number(year);

    if (!title.trim() || !finalSlug || !location.trim() || !region.trim()) {
      setError("Title, slug, location and region are required.");
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(finalSlug)) {
      setError("Slug may only contain lowercase letters, numbers and hyphens.");
      return;
    }
    if (existingSlugs.includes(finalSlug) && finalSlug !== orig?.slug) {
      setError(`Slug “${finalSlug}” is already in use. Pick another.`);
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setError("Guide price must be a positive number (USD).");
      return;
    }
    if (!image.trim()) {
      setError("A principal image is required.");
      return;
    }
    if (!blurb.trim() || !description.trim()) {
      setError("Blurb and description are required.");
      return;
    }

    const input: Property = {
      slug: finalSlug,
      title: title.trim(),
      location: location.trim(),
      region: region.trim(),
      price: Math.round(priceNum),
      beds: Number(beds) || 0,
      baths: Number(baths) || 0,
      area: Number.isFinite(areaNum) ? areaNum : 0,
      lot: lot.trim(),
      status,
      type: type.trim() || "Residence",
      year: Number.isFinite(yearNum) ? yearNum : new Date().getFullYear(),
      image: image.trim(),
      gallery: gallery.map((g) => g.trim()).filter(Boolean),
      blurb: blurb.trim(),
      description: description
        .split(/\n{2,}/)
        .map((para) => para.trim())
        .filter(Boolean),
      features: features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean),
      featured,
      agent,
    };

    setBusy(true);
    try {
      await saveProperty(orig, input);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title={orig ? `Edit — ${orig.title}` : "New residence"}
      subtitle={orig ? `/${orig.slug}` : "Publishes to /properties once synced"}
      onClose={onCancel}
      wide
    >
      <form onSubmit={submit} className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Title" required className="sm:col-span-2">
            <input
              className={inputCls}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
            />
          </Field>
          <Field label="Slug" required hint="Public URL identifier">
            <input
              className={`${inputCls} num`}
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
            />
          </Field>
          <Field label="Location" required hint='e.g. "Malibu, California"'>
            <input className={inputCls} value={location} onChange={(e) => setLocation(e.target.value)} />
          </Field>
          <Field label="Region" required hint="Used by the region filter">
            <input className={inputCls} value={region} onChange={(e) => setRegion(e.target.value)} list="admin-regions" />
            <datalist id="admin-regions">
              {Array.from(new Set([...(orig ? [orig.region] : []), "Pacific Coast", "Europe", "Americas", "Mediterranean", "Mountains", "Asia Pacific"])).map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </Field>
          <Field label="Type" hint='e.g. "Contemporary Estate"'>
            <input className={inputCls} value={type} onChange={(e) => setType(e.target.value)} />
          </Field>
          <Field label="Guide price (USD)" required>
            <input
              type="number"
              min={1}
              className={`${inputCls} num`}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="28500000"
            />
          </Field>
          <Field label="Status" required>
            <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as PropertyStatus)}>
              {PROPERTY_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Bedrooms">
            <input type="number" min={0} className={`${inputCls} num`} value={beds} onChange={(e) => setBeds(e.target.value)} />
          </Field>
          <Field label="Bathrooms">
            <input type="number" min={0} className={`${inputCls} num`} value={baths} onChange={(e) => setBaths(e.target.value)} />
          </Field>
          <Field label="Interior (sq ft)">
            <input type="number" min={0} className={`${inputCls} num`} value={area} onChange={(e) => setArea(e.target.value)} />
          </Field>
          <Field label="Land" hint='e.g. "1.8 acres"'>
            <input className={inputCls} value={lot} onChange={(e) => setLot(e.target.value)} />
          </Field>
          <Field label="Year built">
            <input type="number" min={0} max={2200} className={`${inputCls} num`} value={year} onChange={(e) => setYear(e.target.value)} />
          </Field>
          <Field label="Advisor" hint="From People">
            <select className={inputCls} value={agent} onChange={(e) => setAgent(e.target.value)}>
              <option value="">— none —</option>
              {agentOptions.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-card border border-rule bg-mist px-4 py-3.5">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="size-4 accent-[#1d1d1f]"
          />
          <span className="text-[0.88rem] text-ink">Featured — show on the home page grid</span>
        </label>

        <ImageField label="Principal image" value={image} onChange={setImage} upload={upload} notify={notify} />

        <Field label="Gallery" hint="Images 2–4 appear beside the principal image on the detail page">
          <div className="space-y-2.5">
            {gallery.map((g, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <input
                  className={`${inputCls} num flex-1`}
                  value={g}
                  onChange={(e) => setGallery(gallery.map((x, xi) => (xi === i ? e.target.value : x)))}
                  placeholder="/media/p6.jpg"
                />
                {g && <Thumb src={g} alt="" className="hidden h-10 w-14 border border-rule sm:block" />}
                <IconBtn
                  label="Remove image"
                  tone="danger"
                  onClick={() => setGallery(gallery.filter((_, xi) => xi !== i))}
                >
                  {icons.trash}
                </IconBtn>
              </div>
            ))}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setGallery([...gallery, ""])}
                className="btn btn-quiet inline-flex items-center gap-2 px-4 py-2 text-[0.82rem]"
              >
                {icons.plus} Add URL
              </button>
              <label className="btn btn-quiet inline-flex cursor-pointer items-center gap-2 px-4 py-2 text-[0.82rem]">
                {icons.upload} Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    upload(file)
                      .then((url) => setGallery((prev) => [...prev, url]))
                      .catch((err: unknown) =>
                        notify("error", err instanceof Error ? err.message : "Upload failed."),
                      );
                  }}
                />
              </label>
            </div>
          </div>
        </Field>

        <Field label="Blurb" required hint="One line — shown in cards and metadata">
          <textarea rows={2} className={`${inputCls} resize-none`} value={blurb} onChange={(e) => setBlurb(e.target.value)} />
        </Field>

        <Field label="Description" required hint="Paragraphs separated by a blank line">
          <textarea
            rows={7}
            className={`${inputCls} resize-y`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>

        <Field label="Features" hint="One per line">
          <textarea
            rows={6}
            className={`${inputCls} resize-y`}
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            placeholder={"Infinity edge pool\nWine room\n…"}
          />
        </Field>

        {error && (
          <p role="alert" className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-[0.82rem] text-red-700">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3 border-t border-rule pt-6">
          <button type="submit" disabled={busy} className="btn btn-solid disabled:opacity-55">
            {busy ? "Saving…" : orig ? "Save changes" : "Create residence"}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-quiet">
            Cancel
          </button>
          {orig && (
            <a
              href={`/properties/${orig.slug}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-quiet ml-auto px-4 py-2 text-[0.82rem]"
            >
              View live page ↗
            </a>
          )}
        </div>
      </form>
    </Modal>
  );
}
