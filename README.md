# Digital Dreams Events

Portal for Digital Dreams events. Admin creates programs and DP/attendance
card templates; each program gets a public page and a shareable link.

## Stack

- Frontend: React + Vite + TypeScript (`src/`)
- Backend: PHP 8 + JSON files, no database (`api/`, `data/`, `uploads/`)

## Run

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173` using mock data (no backend needed).

## Use the real backend instead of mocks

```bash
php -S 127.0.0.1:8090 -t .
PHP_DEV_PROXY_TARGET=http://127.0.0.1:8090 npm run dev
```

`.env`:

```
VITE_USE_MOCKS=false
VITE_API_BASE_URL=
```

## Routes

| Route | What |
| --- | --- |
| `/` | Events list |
| `/events/:slug` | Generic event page |
| `/events/kids-coding-bootcamp` | Kids Coding Bootcamp's own page |
| `/admin` | Admin dashboard |
| `/admin/login` | Admin sign in |

## Commands

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
```

## Deploy

Copy `dist/`, `api/`, `data/`, `uploads/` to the host. Make `data/` and
`uploads/` writable. Change the admin password in `data/admin.json` first
(`php -r "echo password_hash('yourpass', PASSWORD_BCRYPT);"`).
