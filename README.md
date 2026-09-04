# Program Attendance Generator

A web app that lets event organizers run **"I'm attending" attendance cards** for
their programs — the kind of personalized graphic people post on WhatsApp,
Instagram, or LinkedIn to announce they'll be at an event.

It has two sides:

- **Admin** — organizers create a *program*, attach one or more card *templates*,
  and get a public link to share. They can see every card participants generate.
- **Public** — an attendee opens the program link, types their name, optionally
  uploads a photo, and instantly downloads a personalized attendance card as a
  **PDF and an image**, then shares it across social media.

Everything revolves around the **Program**:

```
Program → Templates → Public Link → Participant Generation → Download & Share
```

> **Scope:** the frontend (this SPA) ships alongside a small **PHP + JSON-file
> backend** (`api/`, `data/`, `uploads/` — no database) that persists programs
> and templates and handles admin login. It does **not** yet do the official
> participant-facing PDF/image compositing (`api/generate.php` is a stub that
> returns 501) — that's a separate, unbuilt feature. Until you point the app
> at the PHP backend, it runs against an isolated in-memory **mock** that
> behaves like the real API — flip one env var to switch.

## What you can do

**As an organizer (admin):**
- Create / edit / archive programs (name, slug, dates, description, banner, status, attendance wording).
- Upload templates per program, mark a default, and choose whether a template needs a photo.
- Copy a program's public link to share with attendees.
- Browse and search every generated card, with download links.
- See dashboard stats (programs, templates, participants).

**As an attendee (public):**
- Open a program link and see the event details.
- Enter your name, pick a design (if there are several), upload a photo when required.
- Watch a **live preview** update as you type.
- Generate, then **download the PDF / image**, open a shareable page, or post it to
  **WhatsApp, X, Facebook, LinkedIn, Telegram, or email** (plus native share & copy link).

## Routes

| Route | Audience | Purpose |
| --- | --- | --- |
| `/` | Public | Events portal — lists every active program, links to its page |
| `/events/kids-coding-bootcamp` | Public | Kids Coding Bootcamp's own bespoke microsite |
| `/events/kids-coding-bootcamp/badge` | Public | Its badge generator |
| `/events/kids-coding-bootcamp/certificate` | Public | Its certificate generator |
| `/events/:slug` | Public | Generic page for any other program (until it gets a bespoke one) |
| `/admin/login` | Admin | Sign in (PHP session; skipped in mock mode) |
| `/admin` | Admin | Dashboard |
| `/admin/programs` | Admin | Programs list + create |
| `/admin/programs/:id` | Admin | Program details (Overview / Templates / Generations / Settings) |
| `/admin/templates` | Admin | All templates — upload, mark default |
| `/admin/generations` | Admin | All participant generations |
| `/admin/settings` | Admin | Platform configuration |
| `/programs/:slug/attending` | Public | Participant attendance flow (mocked; not wired to a real generator yet) |
| `/share/:generationId` | Public | Shareable generated card |

## Participant flow

1. Open the program link (`/programs/:slug/attending`).
2. Enter a full name.
3. Pick a design (if more than one) and upload a photo when the template requires it.
4. See a live, non-official preview update as you type.
5. Click **Generate** → the backend returns the PDF/image URLs.
6. Download PDF, download image, share to social media, open the shareable page, or generate another.

> The official artwork is produced by the backend. The client only renders a
> non-official preview (`src/shared/utils/attendanceComposer.ts`), which the mock
> also uses to return real downloadable files during development.

## Architecture

The codebase is split into three top-level areas. Imports use the `@/` alias
(→ `src/`), so files can move without churning relative paths.

```
src/
  admin/                 ADMIN app only
    AdminLayout.tsx
    pages/               Dashboard, Programs, ProgramDetails, Templates, Generations, Settings
    components/          ProgramFormModal, TemplateFormModal, GenerationsTable

  public/                PUBLIC participant app only
    pages/               PublicAttendancePage, SharePage
    components/          ProgramAttendance, SuccessPanel, SocialShare, share-page pieces
    hooks/               usePublicProgram, usePublicGeneration, useAttendancePreview, useImageUpload

  shared/                used by BOTH admin and public
    services/            API layer — components never call fetch directly
      config.ts            API base URL + USE_MOCKS toggle
      http.ts              fetch wrapper (real backend)
      programService / templateService / generationService
      mock/                isolated in-memory mock (mockData.ts, mockApi.ts)
    types/domain.ts      Program, ProgramTemplate, Generation, payloads
    hooks/               useAsyncData
    components/          BrandMark + ui/ primitives (states, modal, badges, …)
    utils/               formatting, links, file + canvas (attendance) helpers

  App.tsx                routes admin vs public
  main.tsx               entry
```

Dependency rule: `admin` and `public` may import from `shared`; `shared`
never imports from `admin` or `public`.

## Configuration

Copy `.env.example` to `.env`:

```bash
VITE_USE_MOCKS=true                          # false → use the real backend
VITE_API_BASE_URL=https://api.example.com    # leave empty for same-origin
VITE_SITE_URL=https://dp.digitaldreamsng.com
```

With `VITE_USE_MOCKS=false`, the same service layer calls the PHP endpoints
under `api/` (`programs.php`, `templates.php`, `generations.php`, `auth.php`,
`generate.php`). No component changes are needed to switch.

Set `VITE_SITE_URL` to the deployed public origin so canonical URLs and social
metadata point at the production site.

### PHP backend (`api/`, `data/`, `uploads/`)

Plain PHP 8 + JSON files, no database — deploy these three folders next to
the built `dist/` on any Apache/PHP host:

- `data/*.json` holds programs (with their templates embedded), generations,
  and the one admin account; seeded automatically on first read. `data/` must
  be writable by the web server user and is blocked from direct web access
  (`data/.htaccess`).
- `uploads/templates/` and `uploads/banners/` hold images decoded from the
  `data:` URLs the admin forms already produce client-side.
- Admin auth is a PHP session + CSRF token (`api/auth.php`); `/admin/*` is
  wide open in mock mode but redirects to `/admin/login` once
  `VITE_USE_MOCKS=false`.
- **Change the seeded admin password before going live** — it's in
  `data/admin.json` as a bcrypt hash; generate a new one with
  `php -r "echo password_hash('yourpass', PASSWORD_BCRYPT);"` and replace it.
- `public/.htaccess` (copied into `dist/` by Vite) adds the SPA fallback
  rewrite so deep links survive a refresh, without touching `/api/` or
  `/uploads/`.

To develop against the real backend locally (instead of mocks), run PHP's
built-in server and point Vite's dev proxy at it — this keeps everything
same-origin so the session cookie isn't dropped as cross-site:

```bash
php -S 127.0.0.1:8090 -t .          # serves api/, data/, uploads/
PHP_DEV_PROXY_TARGET=http://127.0.0.1:8090 npm run dev
```

Then set `VITE_USE_MOCKS=false` and `VITE_API_BASE_URL=` (empty) in `.env`.

The public bootcamp site also ships as an installable PWA. Production builds
register `/sw.js`, cache the public shell and core assets, and use
`/offline.html` as the offline fallback. The admin area and API routes are kept
online-only.

## Develop

Requires Node 18+ (Vite 6).

```bash
npm install
npm run dev          # admin: http://localhost:5173/admin
npm run typecheck
npm run lint
npm run build
```

`/` is the events portal (lists every program); Kids Coding Bootcamp's own
microsite is at `/events/kids-coding-bootcamp`. To preview the mocked
attendance flow, open a program link directly, e.g.
`http://localhost:5173/programs/digital-dreams-tech-bootcamp-2026/attending`
(in the admin Programs table, the **Link** button copies it for you).
