# Vensam Properties data contract (Firebase)

The frontend at `/` (public site) and `/admin` (management console) talks to
**Firebase directly** — no custom REST backend:

- **Auth:** Firebase Authentication (email/password), session persisted by the
  SDK's own browser storage (IndexedDB, provider-owned). The app itself never
  writes localStorage/sessionStorage.
- **Database:** Cloud Firestore. The client SDK handles signed-in reads/writes
  (gated by `firestore.rules`); the Admin SDK handles SSR reads on the public
  site and the seed script.
- **Config:** client via `NEXT_PUBLIC_FIREBASE_*` env vars (see
  `.env.example`); server via `FIREBASE_SERVICE_ACCOUNT`. With these unset,
  `apiConfigured` is false: admin stays empty, accounts stay locked, the
  contact form is disabled, and marketing pages serve the bundled presentation
  copy. Nothing is stored in the browser.

## Collections (documents keyed by slug unless noted)

| Collection | Doc ID | Written by | Read |
| --- | --- | --- | --- |
| `properties` | `slug` | admin (rules: member of `admins/{uid}`) | public |
| `agents` | `slug` | admin | public |
| `journal` | `slug` | admin | public |
| `enquiries` | auto-id | anyone (public contact form) | admin only |
| `favorites` | visitor `uid` | the signed-in visitor (`{ slugs: string[] }`) | owner only |
| `admins` | admin `uid` | seed script / Admin SDK only | the user themselves |

`firestore.rules` encodes exactly this: catalogue → public read, admin-only
write; enquiries → public create, admin read/update/delete; favorites →
owner-only; admins → self-read, no client writes.

## Entities

### Property (`properties/{slug}`)

```ts
{
  slug: string;          // unique, kebab-case
  title: string;
  location: string;      // "Malibu, California"
  region: string;        // "Pacific Coast" | "Europe" | "Americas" | …
  price: number;         // USD, integer
  beds: number;
  baths: number;
  area: number;          // sq ft
  lot: string;           // "1.8 acres"
  status: "For Sale" | "Private Listing" | "Under Offer";
  type: string;          // "Contemporary Estate"
  year: number;
  image: string;         // "/media/p1.jpg" or external URL
  gallery: string[];
  blurb: string;         // one-liner
  description: string[]; // paragraphs
  features: string[];    // one per line
  featured?: boolean;
  agent: string;         // Agent.slug ("" = unassigned)
}
```

### Agent (`agents/{slug}`)

```ts
{
  slug: string; name: string; role: string; image: string;
  phone: string; email: string; languages: string; focus: string; bio: string;
}
```

### JournalPost (`journal/{slug}`)

```ts
{
  slug: string; title: string; category: string; date: string; // "March 2026"
  read: string;      // "8 min"
  image: string; excerpt: string;
}
```

### Enquiry (`enquiries/{autoId}`)

```ts
{
  id: string;             // Firestore doc id
  name: string;
  email: string;
  phone: string;          // may be ""
  guide: string;          // "$5M — $15M"
  interest: string;       // "Acquiring" | "Selling" | "Portfolio advice" | "Restoration"
  message: string;
  status: "new" | "read" | "handled";
  createdAt: Timestamp;   // serverTimestamp on create (rendered as ISO)
}
```

### Favorite (`favorites/{uid}`)

```ts
{ slugs: string[] }       // full list returned to the client after each write
```

### Admin (`admins/{uid}`)

```ts
{ email: string; role: "admin" }
```

## Client API surface (`src/lib/api.ts`)

`src/lib/api.ts` keeps the earlier REST-client signatures so components never
touch Firebase directly. Same exports as before (`apiConfigured`, `ApiError`,
`OfflineError`, `getToken/setToken`, `getStoredUser/setStoredUser`, `api.*`),
now backed by the client SDK:

| Client call | Firestore / Auth operation |
| --- | --- |
| `api.login(email, password)` | `signInWithEmailAndPassword` + reject if not in `admins/{uid}` |
| `api.me()` | current user + admin membership check |
| `api.register/authLogin/authMe` | Firebase Auth (visitor accounts) |
| `api.listFavorites/addFavorite/removeFavorite` | `favorites/{uid}.slugs` |
| `api.listProperties/createProperty/updateProperty/deleteProperty` | `properties` |
| `api.listAgents/…`, `api.listJournal/…` | `agents`, `journal` |
| `api.sendEnquiry` | `addDoc(enquiries, { …, createdAt: serverTimestamp() })` |
| `api.listEnquiries/updateEnquiry/deleteEnquiry` | `enquiries` (admin-gated by rules) |
| `api.health` | configured check + probe read |
| `api.upload` | not wired yet (needs Firebase Storage) — paste image URLs |

## SSR reads (public marketing pages)

`src/lib/server-api.ts` reads via the Admin SDK (`FIREBASE_SERVICE_ACCOUNT`),
per-request memoised (`React.cache`). While the service account is unset the
bundled seed data keeps the marketing pages looking finished; once Firestore
is connected the database is the single source of truth (an empty database
renders empty pages — run `npm run seed` first).

## Seeding

`npm run seed` (tsx + firebase-admin) upserts `properties`/`agents`/`journal`
from `src/lib/data.ts` by slug, and — when `ADMIN_EMAIL`/`ADMIN_PASSWORD` are
set — creates the Auth user and writes `admins/{uid}` to unlock admin writes.

## No local storage — database only

The frontend stores **nothing** in the browser (no localStorage, no
sessionStorage, no cookies — except the cookie-consent preference itself).
Until Firebase env vars are present:

- `/admin` is empty: no seed fallback, write actions disabled, mutations fail
  with an error toast if attempted.
- Visitor accounts are locked: the sign-up/sign-in modal shows but its forms
  are disabled with an explanatory notice.
- The public contact form's submit button is disabled with a similar notice.

There is no offline queue and no "local mode". A failed write is a failed
write: the operator sees the error and retries when the database is back.

## Environment variables

See `.env.example`: six `NEXT_PUBLIC_FIREBASE_*` client values, plus
`FIREBASE_SERVICE_ACCOUNT`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` for SSR/seed. The
same set must be added to Vercel (Project Settings → Environment Variables)
when the site is deployed — the app never performs any hosting itself.
