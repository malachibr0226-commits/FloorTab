# FloorTab

A restaurant **floor & tab management** app. See a live floor plan of tables,
open a tab for a table, add menu items, track the running total, and close &
pay the tab.

Built as a TypeScript monorepo:

- `server/` — Express REST API with a JSON-file-backed store (no external DB required)
- `client/` — Vite + React + TypeScript single-page app

## Prerequisites

- Node.js >= 20 (developed against Node 22)
- npm 10+

## Getting started

```bash
npm install        # installs all workspaces
npm run dev        # starts the API (:4000) and the client (:5173) together
```

Then open http://localhost:5173.

The Vite dev server proxies `/api/*` requests to the API on port 4000, so the
UI works with a single URL.

## Useful scripts

Run from the repo root:

| Command | Description |
| --- | --- |
| `npm run dev` | Run API + client dev servers concurrently |
| `npm run build` | Type-check and build both packages |
| `npm run typecheck` | Type-check both packages without emitting |
| `npm run lint` | Lint both packages with ESLint |
| `npm run start` | Run the built API server |

## API overview

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/menu` | List menu items |
| `GET` | `/api/tables` | List tables with tab status & total |
| `POST` | `/api/tables/:id/open` | Open a tab (`{ serverName }`) |
| `POST` | `/api/tables/:id/items` | Add a menu item (`{ menuItemId, quantity }`) |
| `DELETE` | `/api/tables/:id/items/:itemId` | Remove a line item |
| `POST` | `/api/tables/:id/close` | Close & pay a tab, returns a receipt |
| `POST` | `/api/reset` | Reset the floor to the seeded state |

Data is persisted to `server/data/floortab.json` (git-ignored).
