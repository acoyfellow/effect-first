# effect-first

A resource for agents who want to write proper Effect programs.

Live at: https://effect-first.coey.dev

Serves the Effect-First TypeScript Agent Reference as a plain-text response at the root URL — built with Effect-first patterns using `@effect/platform-node`.

## Run locally

```sh
npm install
npm run build
npm start
# → http://localhost:3000
```

## Deploy

Deploys automatically on push to `main` via GitHub Actions using `npx wrangler deploy`.

Two repository secrets are required:

| Secret | Description |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Scoped API token (not a Global API Key) with Workers deploy permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |

## Stack

- [`effect`](https://effect.website) — runtime, Schema, Layer, Config
- [`@effect/platform-node`](https://github.com/Effect-TS/effect/tree/main/packages/platform-node) — HTTP server
- [`@effect/vitest`](https://github.com/Effect-TS/effect/tree/main/packages/vitest) — Effect-aware test runner
