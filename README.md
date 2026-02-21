# effect-first

A reference for agents who want to write proper Effect programs.

Live at: https://effect-first.coey.dev

## Endpoints

| Route | Tokens | Purpose |
|---|---|---|
| `/` | ~200 | Index — routing manifest, tells agents what to fetch |
| `/rules` | ~800 | The 9 rules, terse, no examples |
| `/reference` | ~600 | Imports, primitives, type signatures, quick-lookup |
| `/examples` | ~2000 | Copy-paste ready code patterns |
| `/anti-patterns` | ~400 | "Never X → do Y" correction table |
| `/http-server` | ~1700 | HttpApi declarative server guide |
| `/http-client` | ~1100 | HttpClient service guide |
| `/sql` | ~1650 | @effect/sql guide |
| `/cli` | ~1250 | CLI + Command execution guide |
| `/streams` | ~1400 | Stream, Sink, Channel guide |
| `/concurrency` | ~450 | Concurrency primitives |
| `/resources` | ~450 | Resource lifecycle + Scope |
| `/full` | ~7000 | Complete reference, all sections combined |
| `/health` | — | JSON `{ "ok": true }` |

Designed for token-aware agents. Fetch only what you need.

## Examples

The `examples/` directory shows how to wire different agents to use effect-first:

- **[`examples/shelley/`](examples/shelley/)** — Shelley (`AGENTS.md`) — the original
- **[`examples/claude-code/`](examples/claude-code/)** — Claude Code (`CLAUDE.md`)
- **[`examples/cursor/`](examples/cursor/)** — Cursor (`.cursor/rules/effect-first.mdc`)
- **[`examples/codex/`](examples/codex/)** — OpenAI Codex (`AGENTS.md`)
- **[`examples/copilot/`](examples/copilot/)** — GitHub Copilot (`.github/copilot-instructions.md`)
- **[`examples/pi/`](examples/pi/)** — Pi (`.ai/instructions.md`)

Each example includes a tool-specific config file and a unique working project that demonstrates different Effect patterns:

| Example | Unique feature |
|---|---|
| Shelley | Base greeter CLI — Effect.fn, Schema.TaggedError, Context.Tag, Layer, Schema.Class |
| Claude Code | Base greeter CLI — CLAUDE.md wiring |
| Cursor | Schema validation CLI — Schema.Class, branded types, SchemaRegistry + Validator services, .cursor/rules MDC wiring |
| Codex | Greeter + TodoRepo — multi-service composition with Layer.mergeAll |
| Copilot | Greeter + Stream log processor — Stream, Sink, aggregation pipelines |
| Pi | Health monitor — Schema.Config, Schedule.exponential, Effect.retry, Effect.timeout |

## Run locally

```sh
npm install
npm run build
npm start
# → http://localhost:3000
```

## Deploy

Deploys automatically on push to `main` via GitHub Actions.

Two repository secrets required:

| Secret | Description |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Scoped API token with Workers deploy permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |

## Stack

- [`effect`](https://effect.website) — runtime, Schema, Layer, Config
- [`@effect/platform-node`](https://github.com/Effect-TS/effect/tree/main/packages/platform-node) — HTTP server
- [`@effect/vitest`](https://github.com/Effect-TS/effect/tree/main/packages/vitest) — Effect-aware test runner
- [Cloudflare Workers](https://workers.cloudflare.com) — deployment target
- [Diátaxis](https://diataxis.fr) — documentation structure (adapted for agent consumption)
