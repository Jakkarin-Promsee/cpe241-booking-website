# DatabaseWeb — Cinema Admin (Client)

This repository folder contains the **frontend** for **DatabaseWeb**: a single-page **cinema / theater admin console** built with React. It provides dashboards, movie and screen management, booking lists, and reporting views. Business data is currently supplied by **static TypeScript modules** (`src/store/temp*.ts`) and **client-side auth**; there is **no API or database layer** in this workspace yet, so it works as a UI prototype or coursework shell ready to be wired to a backend.

---

## Tech stack

| Area                | Choice                                             |
| ------------------- | -------------------------------------------------- |
| Runtime             | **Node.js** (for tooling; use a current LTS)       |
| Framework           | **React 19**                                       |
| Language            | **TypeScript** (~6.x)                              |
| Build / dev         | **Vite 8**                                         |
| Routing             | **React Router 7** (`BrowserRouter`)               |
| Styling             | **Tailwind CSS 4** via `@tailwindcss/vite`         |
| Global client state | **Zustand 5** (auth + `persist` to `localStorage`) |

Path alias: `@/*` → `src/*` (see `vite.config.ts` and `tsconfig.app.json`).

---

## Prerequisites

- **Node.js** 20+ recommended (Vite 8 and the toolchain expect a modern Node).
- **npm** (comes with Node). The lockfile is `package-lock.json`.

---

## Setup

From the **client** directory:

```bash
cd client
npm install
```

### Optional: login background image

`Login.tsx` and `NotFound.tsx` import `@/assets/login_bg.png`. If that file is missing in your clone, add a PNG at `src/assets/login_bg.png` or adjust the imports; otherwise the dev server or build may error on unresolved assets.

---

## Scripts

| Command           | Purpose                                                                         |
| ----------------- | ------------------------------------------------------------------------------- |
| `npm run dev`     | Start Vite dev server (default [http://localhost:5173](http://localhost:5173)). |
| `npm run build`   | Typecheck (`tsc -b`) then production bundle to `dist/`.                         |
| `npm run preview` | Serve the production build locally for smoke testing.                           |
| `npm run lint`    | ESLint on the project (`eslint.config.js`, flat config).                        |

---

## How to use the app

### Entry and router

- Bootstrap: `src/main.tsx` mounts the app inside `BrowserRouter` and loads `src/index.css` (Tailwind entry: `@import "tailwindcss";`).
- Routes are defined in `src/App.tsx`.

### URLs

| Path                  | Behavior                                                        |
| --------------------- | --------------------------------------------------------------- |
| `/admin/login`        | Login screen. If already authenticated, redirects to `/admin/`. |
| `/admin` or `/admin/` | Dashboard (nested under `AdminPageLayout`).                     |
| `/admin/movies`       | Movie management.                                               |
| `/admin/screens`      | Screen / showtime timeline management.                          |
| `/admin/booking`      | Booking table with filters and pagination.                      |
| `/admin/reports`      | Reports with charts and filter UI.                              |
| Anything else         | `NotFound` (404) with links back to admin.                      |

`UrlPathConfig.ts` is the single place for admin nav labels, icons, titles, and per-route **background / topbar colors**. `resolveAdminPathKey()` normalizes `/admin` to `/admin/` so the dashboard config matches.

### Authentication (demo only)

- Implemented in `src/store/useAuth.ts` with Zustand + `persist`.
- **Not** a real server login: credentials are checked in the browser after a short simulated delay.
- Persisted key: `cinema-admin-auth` (only `authed` is stored).

Demo accounts (change in `useAuth.ts` for your environment):

- `test` / `test`
- `admin@cinema.com` / `admin123`

Protected routes use `AdminProtectedRoute`; the login route uses `AdminPagePlubishedRoutes` (typo in source: “Plubished”) to bounce authenticated users away from the login page. **Do not use these patterns in production** without a real auth API, HTTPS, and secure session or token handling.

### Layout

- `AdminPageLayout`: sidebar (`NavSidebar`), `Topbar` (title from config, logout), and `<Outlet />` for child routes.
- Logout clears `authed` in the store (persist middleware updates `localStorage`).

---

## Project structure (src)

```
src/
  main.tsx                 # React root + BrowserRouter
  App.tsx                  # Route definitions and auth wrappers
  index.css                # Tailwind import
  assets/                  # Static images / vectors used by UI
  components/
    AdminPageLayout.tsx    # Shell for all /admin/* pages (except login)
    NavSidebar.tsx         # Nav links from ADMIN_Path_CONFIG
    Topbar.tsx             # Page title + logout
    UrlPathConfig.ts       # Admin paths, titles, color sets
    editModal/
      MovieFormModal.tsx   # Add/edit movie form (modal)
      ScreenFormModal.tsx  # Add/edit showtime form (modal)
  pages/
    Login.tsx
    Dashboard.tsx
    MovieManagement.tsx
    ScreenManagement.tsx
    Booking.tsx
    Report.tsx
    NotFound.tsx
  store/
    useAuth.ts             # Zustand auth store
    tempDashboardData.ts   # Static dashboard metrics / chart points
    tempBookingData.ts     # Static booking rows
    tempReportdata.ts      # Static report filters / stats / chart data
    tempMoiveData.ts       # Static movie list (filename spelling: Moive)
    tempScreenData.ts      # Theaters, screens, showtimes seed data
```

---

## Feature overview (by page)

- **Dashboard** — Status cards, a simple SVG line chart (“Weekly Booking Trend”), and an “Upcoming Showtimes” table (placeholder bars in some cells). Data: `tempDashboardData.ts`.
- **Movie management** — Paginated table of movies (title, genre, duration, status), poster placeholder, actions (edit / schedule / delete). Add/edit uses `MovieFormModal`. List source: `tempMoiveData.ts`; in-memory updates are local to the page component pattern (not a global store).
- **Screen management** — Theater tabs, screen dropdown, **day timeline** (10:00–22:00) with colored showtime blocks, add/edit via `ScreenFormModal` (movie, language, format, screen, date, times, seat plan/price). Seed data and colors: `tempScreenData.ts`.
- **Booking** — Status filters, payment-proof affordance, paginated table. Data: `tempBookingData.ts`.
- **Reports** — Time-range filters, summary stats, line and bar charts (SVG), report type and “filter by” controls. Data: `tempReportdata.ts`.
- **Login** — Full-screen branded card over background image.
- **404** — Same visual language as login; links to `/admin/` and `/admin/login`.

---

## Configuration files

- **`vite.config.ts`** — React plugin, Tailwind Vite plugin, `@` alias to `./src`.
- **`tsconfig.json`** — Project references to `tsconfig.app.json` (app) and `tsconfig.node.json` (Vite config).
- **`tsconfig.app.json`** — `ES2023`, `DOM`, strict unused checks, `paths` for `@/*`.
- **`eslint.config.js`** — TypeScript ESLint, React Hooks, React Refresh for Vite.
- **`index.html`** — Root `<div id="root">` and document title (currently generic `"client"`; you can rename for production).

---

## Building for production

```bash
npm run build
```

Output goes to **`dist/`**. Deploy `dist` as static files behind any static host or CDN. Because the app uses **`BrowserRouter`**, the host must **rewrite unknown paths to `index.html`** (SPA fallback) so deep links like `/admin/movies` load correctly.

---

## Extending toward a real “DatabaseWeb”

Today, persistence is **in-memory or static imports** except auth’s `authed` flag. A typical next step would be:

1. Add a backend (REST, GraphQL, or RPC) and database.
2. Replace `temp*.ts` with `fetch`/client SDK calls and optional Zustand or React Query for server state.
3. Replace `useAuth` with token/cookie-based login against your API.
4. Add environment-based API base URLs (`import.meta.env.VITE_*` in Vite).

---

## Troubleshooting

- **`npm install` fails** — Use a current Node LTS; delete `node_modules` and retry if the lockfile was generated on another OS/arch.
- **Missing `login_bg.png`** — Add the asset or remove/replace the background `url()` in `Login.tsx` / `NotFound.tsx`.
- **Blank page on refresh at `/admin/...`** — Configure SPA history fallback on your static server.

---

## License / course context

No license file is present in this folder; treat as private or course work unless your instructor or team specifies otherwise.
