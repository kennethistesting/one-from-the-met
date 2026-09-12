# One From The Met

One artwork from The Metropolitan Museum of Art every day.

A small, independent daily art publication: one permanent selection per New York calendar day, an image-led entry, three learning prompts, and a growing monthly archive. No accounts, paid APIs, image hosting, or AI service is required.

## Stack

- React, Vite, strict TypeScript, React Router (HashRouter), plain CSS
- Supabase Postgres and the Supabase JS public read client
- GitHub Pages and GitHub Actions
- [The Met Collection API](https://metmuseum.github.io/)

## Local development

Use Node **22.12 or newer** and npm.

```bash
npm ci
cp .env.example .env.local
# Fill in the public Supabase values below.
npm run dev
```

The default local URL is `http://localhost:5173/one-from-the-met/`.

```bash
npm test
npm run build
npm run preview
```

Without Supabase configuration, the app displays its recoverable loading-error state. It never invents today's object or silently substitutes sample data. A configured database with no entry for today displays “Today's object is being prepared.”

## Environment

Frontend `.env.local`:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
VITE_BASE_PATH=/one-from-the-met/
```

`VITE_BASE_PATH` is optional and defaults to `/one-from-the-met/`. Use `/` for a custom domain, or `/<repository-name>/` for a differently named repository. The Pages workflow derives this path automatically from GitHub Pages configuration.

Only public anon or `sb_publishable_` keys belong in the frontend. The Vite configuration rejects recognized private key formats before bundling. Never place service-role credentials in **any** `VITE_*` variable, source file, or commit. `.env` and local variants are ignored; `.env.example` contains no credentials. Admin scripts are outside the browser import graph and source maps are disabled.

## Supabase setup

1. Create or choose a Supabase Free project for this application.
2. Run [`supabase/schema.sql`](supabase/schema.sql) once in its SQL Editor. It is a transactional initial schema, not a repeatable migration; do not rerun against an existing table.
3. Ensure the Data API is enabled and exposes the `public` schema.
4. Copy the project URL and public anon/publishable key into the frontend environment.
5. Put the service-role key directly in GitHub Actions secrets, as described below. Do not paste it into chat or put it in this repository.

The table explicitly grants public SELECT, revokes public write privileges, and enables row-level security with a SELECT-only anon policy. The service role can insert records. Unique constraints on `display_date` and `met_object_id` enforce one object per day and no repeated objects, including concurrent runs.

The two named indexes from the specification are included. The unique constraints also create indexes; the extra indexes can be reconsidered if the schema grows significantly.

No Supabase Auth, Storage, Realtime, Edge Functions, or database cron is used. Images load directly from Met image URLs. Free projects can be paused by the provider; if reads fail, check project health in the Supabase dashboard.

## Daily selection

The privileged job requires:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

With these supplied securely in the process environment:

```bash
npm run daily-object
```

The script does not automatically load `.env.local`. In production the credentials exist only in GitHub Actions secrets. No `OPENAI_API_KEY` is needed or read.

The pipeline:

1. Determines the current `America/New_York` date, then exits if it already exists.
2. Requests up to 500 highlight candidates from `/public/collection/v1.1/search?hasImages=true&isHighlight=true&offset=0&limit=500`.
3. Shuffles locally with Fisher–Yates and tries no more than 20 unique candidates.
4. Retrieves `/public/collection/v1/objects/{objectID}` and validates ID, title, public-domain status, Met image/record URLs, and maker/culture/period/dynasty metadata.
5. Skips objects already featured, derives factual learning text, and inserts one immutable daily record with raw metadata.
6. Handles a competing date insert as a successful no-op and a competing object insert by trying another candidate.

Met requests have timeouts and bounded retries. Database errors fail the job rather than being treated as missing records. Failure to find an eligible unused object causes a nonzero exit with no incomplete insert. There is no upsert or overwrite path.

V1 deliberately samples only the first 500 search results, as specified; as this pool is used up, the job may fail despite unused highlights on later API pages. Monitor workflow failures. Expanding the paginated candidate pool is a future operational change, not an automatic switch to uncurated objects.

Learning text is deterministic and derived only from supplied metadata. Missing placeholders are omitted. When descriptive fields are sparse, the prompts ask viewers to inspect form and detail without inventing history. `src/lib/contentGenerator.ts` exposes the `EducationalContent` interface for future optional enrichment.

## GitHub setup and deployment

1. Create a **public** GitHub repository, normally `one-from-the-met`, and push this project to `main`.
2. In **Settings → Pages → Build and deployment**, choose **GitHub Actions**.
3. In **Settings → Secrets and variables → Actions → Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` (public anon or publishable key)
4. Under **Secrets**, add:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Run **Select Daily Met Object** manually from the Actions tab to create the first entry. Run it again to verify the no-op behavior.
6. Push to `main` or manually run **Deploy to GitHub Pages**. It runs tests, builds, uploads `dist`, and deploys with the official Pages Actions.

Do not confuse repository **variables** for the public build with repository **secrets** for the privileged selector. The deploy job has no service-role environment variable. It fails if public connection variables are absent.

The daily workflow runs at `10:00 UTC`, approximately **06:00 EDT / 05:00 EST**. GitHub schedules may be delayed. It also supports `workflow_dispatch`. Public repository schedules can be disabled after prolonged repository inactivity; check the Actions tab if daily entries stop. A daily insert does **not** rebuild the site: browsers query Supabase at runtime.

Hash routes work on GitHub Pages without server rewrites:

```text
https://YOUR_USER.github.io/one-from-the-met/#/
https://YOUR_USER.github.io/one-from-the-met/#/archive
https://YOUR_USER.github.io/one-from-the-met/#/day/2026-09-08
```

Dates are validated before querying. Future entries are omitted from public frontend queries. Previous/next navigation queries actual adjacent records and permits gaps in the calendar. Archive reads use keyset pagination so they continue beyond the default Supabase response limit. The homepage checks for New York date rollover while open and on tab visibility changes.

## Verification

`npm test` covers timezone boundaries, leap dates, eligibility, external response validation, deterministic content, same-day no-ops, duplicate object handling, bounded attempts, simultaneous selectors, database failure propagation, and frontend key validation. These tests use an in-memory store and do not claim to verify a hosted database.

Before calling the live deployment complete:

- Apply the schema and check that RLS is enabled.
- Using the anon/publishable key, verify SELECT works and INSERT/UPDATE/DELETE are refused.
- Confirm duplicate dates and object IDs are rejected by the database.
- Run the daily workflow twice; the second execution should leave the original row unchanged.
- Open the deployed site and verify the actual image, metadata, and official Met link.
- Check `/archive` and `/day/YYYY-MM-DD` hash routes, refresh them directly, and test adjacent navigation with at least two entries.
- Inspect desktop at 1440px and mobile at 390px, including image failures, absent optional metadata, empty results, and network errors.

## Project map

The homepage hero is authored in **`index.html`**, using Inter and Tailwind's browser CDN as requested. Its generated museum MP4 and poster live in `public/media/`; provenance and the image prompt are recorded in `public/media/README.md`. The hero uses the existing read-only Supabase queries to place today's real Met image inside the case. Full object pages, archive, and About remain React hash routes. The hero's CTA opens today's permanent entry. Services and Locations link to official Met visitor resources, Places opens the archive, and Support links to The Met's support page.

The background is a camera move over a generated still, not text-to-video footage. It plays twice (one repeat), then stops on the final frame; visitors can pause/replay it. Reduced-motion preferences disable automatic playback and entrance animations. The CDN is used at the user's request; Tailwind documents this browser mode as intended for development, so a compiled Tailwind stylesheet would be the next optimization if the single-file/CDN requirement changes.

```text
.github/workflows/       Daily selection and Pages deployment
scripts/                 Met client, date/content helpers, privileged selector
src/components/          Small artwork, navigation, archive and state components
src/pages/               Today, historical day, archive and about
src/lib/                 Public read queries, types, content and date helpers
src/styles/              Editorial palette, typography and responsive CSS
supabase/schema.sql      Initial schema, constraints, grants and RLS
tests/                   Pipeline and security regression tests
```

## Data attribution

All object metadata and artwork imagery originate from [The Metropolitan Museum of Art Collection API](https://metmuseum.github.io/). Every entry links to its official Met object record. Only objects marked public domain with available imagery are eligible. Images are loaded directly from supplied Met URLs and are never downloaded, mirrored, or uploaded by the application. This project is independent and is not affiliated with or endorsed by The Metropolitan Museum of Art.
