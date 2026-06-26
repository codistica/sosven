# SOSVEN — Ayúdanos a Reunir Familias

A humanitarian web app to **search for and report missing people** after the
earthquake in Venezuela. Anyone can publish a report, browse the directory,
report a sighting, or flag that a person has been found.

Built with **Next.js 16 (App Router) + React 19 + Tailwind CSS v4**, backed by
**MongoDB Atlas via Mongoose**, with photo uploads on **Vercel Blob**. Designed
to be quick to deploy and to scale on Vercel's serverless runtime.

## Screens

- **Inicio (`/`)** — hero, search bar, live stats, filters
  (Todos / Hombres / Mujeres / Niños / Adultos Mayores) and a responsive grid of
  reported people.
- **Perfil (`/persona/[id]`)** — full profile, physical description, nearby
  cases, sighting counter, "Reportar Hallazgo" (found) and sighting flows,
  contact + share.
- **Reportar (`/reportar`)** — multi-panel form to file a missing-person report
  with photo upload and reporting tips.
- **Ayuda (`/ayuda`)** — how it works + crisis line.

> The app ships with built-in **sample data**, so it renders immediately even
> before a database is connected. As soon as `MONGODB_URI` is set, all data
> comes from MongoDB.

## Tech & data layer

| Concern        | Choice                                            |
| -------------- | ------------------------------------------------- |
| Framework      | Next.js 16 App Router, Server Components + Actions |
| DB             | MongoDB Atlas (serverless) via Mongoose ODM        |
| Connection     | Cached connection (serverless-safe) in `lib/db/index.ts` |
| Models         | `lib/db/models.ts` (Person, Sighting, FoundReport) |
| Image uploads  | Vercel Blob (`lib/blob.ts`)                        |
| Validation     | Zod (`lib/actions.ts`)                             |

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in MONGODB_URI
npm run dev                  # http://localhost:3000
```

Without `MONGODB_URI` the app runs on sample data (reads only; writes are
disabled with a friendly message).

### Seed the database

```bash
npm run db:indexes   # create indexes
npm run db:seed      # insert the sample personas
```

## Environment variables

| Variable                | Required | Notes                                                        |
| ----------------------- | -------- | ------------------------------------------------------------ |
| `MONGODB_URI`           | yes      | MongoDB Atlas SRV connection string                          |
| `MONGODB_DB`            | no       | Database name (defaults to `sosven`)                         |
| `BLOB_READ_WRITE_TOKEN` | no\*     | Auto-injected on Vercel when a Blob store is connected       |

\* Needed only if you want photo uploads to work in local dev. Without it,
reports still save — just without an image.

## Deploy to Vercel

1. **MongoDB Atlas** — create a free cluster at
   [mongodb.com/atlas](https://www.mongodb.com/atlas), add a database user, and
   allow network access (`0.0.0.0/0` for serverless). Copy the driver
   connection string.
2. **Import the repo** into Vercel (New Project → Import).
3. **Environment Variables** — add `MONGODB_URI` (and optionally `MONGODB_DB`).
4. **Blob store** — Vercel dashboard → Storage → create a Blob store and connect
   it to the project. This injects `BLOB_READ_WRITE_TOKEN` automatically.
5. **Deploy.** After the first deploy, seed data once from your machine
   (`npm run db:seed`) or let real reports populate the directory.

## Project structure

```
app/
  page.tsx                 Home / search
  persona/[id]/page.tsx    Person profile
  reportar/page.tsx        Report form
  ayuda/page.tsx           Help
components/                 Header, footer, cards, forms, controls
lib/
  db/index.ts              Mongoose connection (cached)
  db/models.ts             Mongoose models
  db/schema.ts             TypeScript document types
  db/seed.ts               Seed script
  data.ts                  Read queries
  actions.ts               Server actions (create report, sighting, found)
  blob.ts                  Vercel Blob upload helper
  sample-data.ts           First-run fallback data
```

## Notes

- All pages that read data use `force-dynamic` so the directory is always fresh.
- Person `_id`s are UUID strings for clean, stable `/persona/:id` URLs.
- Phone numbers shown (`0800-SOS-VEN`, `911`, `171`) are placeholders — replace
  with the official crisis lines before going live.
