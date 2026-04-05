# Msgly — MSG to PDF, instantly

A truly web-based converter for Outlook `.MSG` files. Drop files, get clean
PDFs. No Outlook, no desktop installs, no accounts.

Built with **Next.js 15 (App Router)** + **TypeScript** + **Tailwind CSS v4**.

---

## Features (MVP)

- Landing page with hero + feature grid
- Drag & drop converter (single or multiple files)
- Conversion options: include headers, embed attachments, export attachments ZIP
- Single file → direct PDF download
- Multiple files (or ZIP option) → download as `.zip`
- Dark mode (system-aware, togglable)
- Privacy notice: files are processed in-memory and discarded after the response
- Mobile-friendly, desktop-optimized
- Monetization teaser: “Free for now · Upgrade soon for unlimited conversions”

---

## Recommended libraries (2026)

| Purpose | Library | Why |
| --- | --- | --- |
| **MSG parsing** | [`@kenjiuno/msgreader`](https://www.npmjs.com/package/@kenjiuno/msgreader) | The best maintained **pure-JS** MSG parser. Works in Node *and* browser, no native dependencies — critical for Vercel serverless. Extracts subject, sender, recipients, HTML/plain body, and attachments. |
| **PDF generation** | [`@react-pdf/renderer`](https://react-pdf.org) | Declarative React components → high-quality PDF. Server-side safe, no Chromium needed, runs on Vercel out of the box. Great typography, inline images, page numbering. |
| **HTML → text** | [`html-to-text`](https://www.npmjs.com/package/html-to-text) | Cleanly flattens HTML email bodies into readable paragraphs preserving links and tables. |
| **ZIP packaging** | [`jszip`](https://stuk.github.io/jszip/) | Pure JS, streaming ZIP creation — used for multi-file output and attachment bundles. |
| **UI** | Tailwind v4 + `lucide-react` + `next-themes` | shadcn/ui-style primitives (Button, Card, Checkbox, Progress) hand-rolled to keep the dep list small. |

### Alternatives considered

- **Puppeteer / Playwright** — highest fidelity for HTML email, but painful on
  Vercel serverless (needs `@sparticuz/chromium`, cold starts, 50 MB bundle).
  Skipped for MVP; good candidate for a future “pixel-perfect” plan.
- **`pdfkit`** — lower level, more layout work. `@react-pdf/renderer` gives us
  a nicer authoring experience for the same output quality.
- **`pdf-lib`** — great for *editing* existing PDFs, not ideal for rendering
  email content from scratch.

---

## Project structure

```
app/
├── layout.tsx                 # Root layout + ThemeProvider
├── page.tsx                   # Landing page
├── globals.css                # Tailwind v4 theme (light + dark)
├── convert/
│   └── page.tsx               # Converter UI
└── api/
    └── convert/
        └── route.ts           # POST handler — parses MSG, renders PDF, returns file/ZIP
components/
├── ui/                        # Button, Card, Checkbox, Progress
├── upload-zone.tsx            # Drag & drop zone
├── file-list.tsx              # Queued files + status badges
├── site-header.tsx
├── theme-provider.tsx
└── theme-toggle.tsx
lib/
├── utils.ts                   # cn(), formatBytes(), limits
├── msg-parser.ts              # @kenjiuno/msgreader wrapper
└── pdf-generator.tsx          # @react-pdf/renderer Document + render helper
```

---

## Setup

```bash
# 1. Install
npm install

# 2. Create a local env file
cp .env.example .env.local
# fill in Supabase + Stripe keys (see sections below)

# 3. Run dev server
npm run dev
# → http://localhost:3000
```

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Next dev server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Run the full Vitest suite once (CI mode) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:coverage` | Vitest with v8 coverage report |
| `npm run test:bulk` | Only run the bulk conversion suite |

---

## Testing — silent backend conversions

Tests live in `tests/` and run on **Vitest** in a Node environment. They
call the route handler and PDF generator **directly** — no dev server,
no browser, no network — which is what makes them fast and silent enough
for CI.

### Suites

| File | What it covers |
| --- | --- |
| `tests/unit/pdf-generator.test.ts` | `renderEmailToPdfBuffer()` — asserts valid PDF magic bytes, headers on/off, inline image embedding, pagination on long bodies. |
| `tests/unit/convert-route.test.ts` | `POST /api/convert` — single-file PDF response, multi-file ZIP response, attachment-bundle ZIP, filename de-duplication, validation (empty / wrong ext / >20 MB / >25 files), parser error surfacing. Mocks `lib/msg-parser` so no binary fixtures needed. |
| `tests/unit/bulk-convert.test.ts` | **The critical bulk suite.** Renders 25 PDFs in parallel at the generator layer *and* posts 25 files through the route in one request. Verifies each PDF is independently valid, parser is invoked exactly once per file, and header-toggle state is isolated across concurrent renders. Logs per-file timing. |
| `tests/unit/msg-parser.test.ts` | Runs `parseMsg()` against real `.msg` files in `tests/fixtures/` — **auto-skips** when the folder is empty. |

### How the bulk tests stay hermetic

The route and bulk tests use Vitest's hoisted `vi.mock("@/lib/msg-parser", …)`
to replace the Outlook parser with a synthetic `ParsedMessage` factory
(`tests/helpers/synthetic.ts`). Everything downstream — validation,
`@react-pdf/renderer`, `jszip` packaging, response headers — runs for
real. This means:

- **No binary `.MSG` files needed** to exercise the full pipeline.
- Tests are deterministic and reproducible.
- Parser fidelity is verified separately against opt-in fixtures.

### Running

```bash
npm test               # one-shot, all suites
npm run test:watch     # re-run on file changes
npm run test:bulk      # just the bulk suite
npm run test:coverage  # v8 coverage report
```

### Adding real `.MSG` fixtures (optional)

Drop any Outlook `.msg` files into `tests/fixtures/`. They are
git-ignored by default (may contain private content). The parser suite
will pick them up automatically on the next run and assert subject,
sender, body, and attachment extraction against each one.

### Writing new bulk scenarios

`tests/helpers/synthetic.ts` exposes:

```ts
syntheticMessage(overrides?)          // ParsedMessage factory
syntheticImageAttachment(name?)       // 1×1 PNG attachment
syntheticDocAttachment(name?)         // non-image attachment
syntheticMsgFile(name, size?)         // File with .msg extension (bytes ignored by parser mock)
isValidPdfBuffer(buf)                 // %PDF- + %%EOF check
```

To test a new batch size, duplicate the bulk block and swap the count:

```ts
const files = Array.from({ length: 100 }, (_, i) =>
  syntheticMsgFile(`stress-${i}.msg`),
);
```

---

## Supabase setup (step by step)

1. **Create a project** at [supabase.com/dashboard](https://supabase.com/dashboard). Pick any region close to your users.
2. **Grab your keys** from *Project Settings → API*:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` → `SUPABASE_SERVICE_ROLE_KEY` (server only — never commit)
3. **Run the schema.** Open *SQL Editor → New query*, paste the contents of `lib/supabase/schema.sql`, and click **Run**. This creates:
   - `public.profiles` (one row per user, stores plan + Stripe linkage)
   - `public.conversions` (history + monthly usage source)
   - RLS policies (users can only read their own rows)
   - `handle_new_user()` trigger (auto-creates a profile row on signup)
   - `get_monthly_usage(uuid)` helper
   - `conversions` Storage bucket (private, for Pro history PDFs)
4. **Configure auth.** In *Authentication → URL Configuration*:
   - **Site URL**: `http://localhost:3000` (dev) or your production URL
   - **Redirect URLs**: add `http://localhost:3000/auth/callback` and your prod equivalent
5. **Disable email confirmation in dev** (optional, speeds up local testing): *Authentication → Providers → Email* → uncheck *Confirm email*. Re-enable in prod.

That's everything on the Supabase side. The RLS policies + service-role client together mean: the dashboard is safe for clients to query, and the convert route / webhook can bypass RLS when they need to record history or update plans.

## Stripe setup (step by step)

1. **Create a Stripe account** at [dashboard.stripe.com](https://dashboard.stripe.com/register) and stay in **Test mode** until you've verified the flow end-to-end.
2. **Create one Product, two prices.** *Products → + Add product*:
   - Name: `Msgly Pro`
   - Add a recurring price: **$9.00 USD / month** → copy the `price_…` ID into `NEXT_PUBLIC_STRIPE_PRICE_MONTHLY`
   - Click *+ Add another price* on the same product: **$89.00 USD / year** → copy into `NEXT_PUBLIC_STRIPE_PRICE_ANNUAL`
   - Keeping both prices on one product lets the billing portal upgrade/downgrade smoothly.
3. **Get your secret key.** *Developers → API keys* → `sk_test_…` → `STRIPE_SECRET_KEY`.
4. **Install the Stripe CLI** ([stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)).
5. **Forward webhooks to your dev server:**
   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   The CLI prints a `whsec_…` signing secret — copy it into `STRIPE_WEBHOOK_SECRET`. Keep `stripe listen` running while you test.
6. **Enable the billing portal.** *Settings → Billing → Customer portal* → toggle on, allow "Cancel subscription" and "Update payment method".
7. **Test a checkout** using card number `4242 4242 4242 4242`, any future expiry, any CVC. Stripe relays the webhook through the CLI; your profile row should flip to `plan: 'pro'` within seconds.

## Deploying to Vercel

1. **Push** this folder to a new GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Framework preset: **Next.js** (auto-detected). No env vars needed.
4. Click **Deploy**.

### Important notes for Vercel

- The `/api/convert` route sets `runtime = "nodejs"` — `@react-pdf/renderer`
  will not run on the Edge runtime.
- `maxDuration = 60` is set in the route. On **Hobby** this is capped at 10 s,
  which is usually plenty for a handful of small `.MSG` files; on **Pro** you
  get the full 60 s.
- Request body size: Vercel Hobby allows ~4.5 MB per request by default. For
  Pro-tier 50 MB files, upgrade to Vercel Pro or switch the upload flow to a
  direct client upload to **Vercel Blob** (recommended next step post-MVP).
- `serverExternalPackages` keeps `@react-pdf/renderer` and
  `@kenjiuno/msgreader` out of the bundler so they load natively at runtime.

### Production environment variables

After deploying, set **all** keys from `.env.example` in *Vercel → Project → Settings → Environment Variables* for Production:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` (use `sk_live_…` in production)
- `STRIPE_WEBHOOK_SECRET` (create a new webhook in Stripe pointing at `https://your-app.vercel.app/api/stripe/webhook`, then copy its signing secret)
- `NEXT_PUBLIC_STRIPE_PRICE_MONTHLY`, `NEXT_PUBLIC_STRIPE_PRICE_ANNUAL` (live price IDs)
- `NEXT_PUBLIC_APP_URL` (your production URL — used for Stripe redirect URLs)

Also update Supabase *Authentication → URL Configuration* with your production site URL and `https://your-app.vercel.app/auth/callback`.

## Testing monthly limits during development

Monthly usage is derived from rows in `public.conversions`, so there are
three clean ways to exercise the limit without waiting 30 days.

### Option A — lower the limit temporarily (fastest)

Open `lib/plans.ts` and change:

```ts
free: { …, monthlyConversions: 2, … },  // was 8
```

Convert a couple of files, then watch the converter page flip through
the "approaching → exceeded" states. Revert before shipping.

### Option B — seed fake history rows (most realistic)

Get your user id from Supabase *Authentication → Users → (your row) → User UID*, then run in *SQL Editor*:

```sql
-- Push yourself right up to the limit (7 of 8)
insert into public.conversions (user_id, source_filename, output_filename, file_size_bytes, pdf_size_bytes, status)
select
  '<YOUR-USER-UUID>',
  'seed-' || g || '.msg',
  'seed-' || g || '.pdf',
  500000,
  120000,
  'completed'
from generate_series(1, 7) as g;
```

Reload `/convert` — you'll see "1 conversion left" and the soft nudge.
One more real conversion pushes you to the exceeded banner + `402`.
To reset: `delete from public.conversions where user_id = '<YOUR-USER-UUID>';`

### Option C — time-travel the month boundary

The monthly window is `>= date_trunc('month', now() at time zone 'utc')`,
so nudging rows into the previous month makes them "not count":

```sql
update public.conversions
set created_at = created_at - interval '1 month'
where user_id = '<YOUR-USER-UUID>';
```

Handy for verifying that the counter actually resets on the 1st.

### Option D — guest session counter

Guest limits live in a signed cookie (`guest_usage`). To reset,
open devtools → Application → Cookies → delete `guest_usage`.
To exhaust quickly, convert three small files while logged out.

### Verifying subscriptions without real money

In Stripe Test mode:
- `4242 4242 4242 4242` · any future expiry · any CVC → successful subscription
- `4000 0000 0000 9995` → declined card (tests error path)
- From the billing portal, click **Cancel subscription** → the webhook downgrades you to `free` and the banner returns.

Use the Stripe CLI's `stripe trigger customer.subscription.deleted` to fire
events manually without waiting for a real cancellation.

---

## How to make the UI feel clean & trustworthy

Small things compound into trust. These are already baked in — keep them
when iterating.

1. **Lead with the privacy promise.** The banner “Files are processed
   temporarily and automatically deleted after download” appears on the
   landing hero *and* above the convert button. It’s the #1 concern users
   have for this category of tool.
2. **No dark patterns.** The monetization teaser is a single non-blocking
   pill. No interstitials, no “convert limit reached” walls in the MVP.
3. **Honest status.** The file list shows real per-file states
   (queued → converting → done/error) instead of a fake spinner. Users trust
   tools that tell them what’s happening.
4. **Visible limits up front.** “Up to 20 MB per file · up to 25 files” is
   shown in the drop zone — no surprises after they pick a file.
5. **Minimal chrome.** One primary action per screen (“Upload .MSG Files”
   on the landing, “Convert to PDF” on the converter). Ghost/secondary
   styles for everything else.
6. **Typography & spacing.** Generous padding, tight line-height on
   headings, readable line-length (max-w-2xl/3xl), system font stack.
7. **Dark mode that isn’t an afterthought.** Every surface has an explicit
   dark token — no “just invert” look.
8. **Subtle motion, never hype.** The hero blob, drop-zone hover, and
   progress bar are the only animations. No parallax, no bouncing icons.
9. **Consistent radius & borders.** `--radius: 0.75rem` everywhere; one
   border color per theme. Consistency = perceived quality.
10. **No account wall.** Ship the value in 2 clicks — this is the biggest
    trust signal for a utility.

---

## What’s intentionally out of scope (MVP)

- User accounts, history, saved conversions
- Folder upload (just individual / multiple file selection)
- Pixel-perfect HTML email rendering (use the Puppeteer path for that)
- Server storage — everything is in-memory per request
- Rate limiting (add when monetization goes live)

---

## License

Private — all rights reserved until a license is chosen.
