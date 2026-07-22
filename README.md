# FinTrack — Net Worth Tracker

A standalone build of the FinTrack app (originally a Claude artifact), ready
to deploy to Netlify, Cloudflare Pages, Vercel, or any static host.

## Run locally

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

## Build for production

```bash
npm run build
```

Outputs a static site to `dist/`.

## Data storage

Each visitor's data is stored in their own browser via `localStorage`
(see `src/storageShim.js`). Nothing is sent to a server — it's fully
client-side, same as the original Claude artifact version, just tied to
a browser/device instead of a Claude account.

## Deploy

See the chat instructions for step-by-step Netlify / GitHub setup.
