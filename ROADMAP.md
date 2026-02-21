# effect-first roadmap

## The thesis

Agents write bad Effect code by default. Their training data is overwhelmingly Promise/try-catch. Effect has strong opinions that diverge from "normal" TypeScript — and that's exactly why a skill endpoint works. The patterns are testable: code either uses `Effect.fn` or it doesn't, errors are either `Schema.TaggedError` or they're not.

If we can prove that a plain-text endpoint meaningfully improves agent output for Effect, the pattern is replicable for any opinionated framework.

## What we're building

A reference endpoint that makes agents write correct Effect-TS on the first try.

"Correct" means: compiles, follows all 9 rules, uses no anti-patterns, and a human reading the output says "this person knows Effect."

---

## Phase 1: Prove it works ← NOW

**Status: partially done. Content is live. No proof it changes behavior.**

The Shelley example is a showcase, not a test. We need actual evidence.

### 1.1 Benchmark suite (`bench/`)

Create 5 tasks of increasing complexity:

| Task | Tests |
|---|---|
| `01-hello` | Effect.fn, Effect.gen, basic program, NodeRuntime.runMain |
| `02-errors` | Schema.TaggedError, catchTag, error recovery |
| `03-service` | Context.Tag, Layer.effect, provide at entry point |
| `04-schema` | Schema.Class, branded types, JSON encode/decode |
| `05-full-stack` | All of the above: service with errors, schema, config, tests |

Each task has:
- `prompt.md` — what to ask the agent
- `judge.ts` — an Effect program that reads the output and checks conformance (does it use Effect.fn? are errors TaggedError? etc.)
- `expected/` — reference solution for comparison

The judge is the product. If the judge can reliably score Effect code quality, we have a feedback loop.

### 1.2 Run the benchmark

- Run each task with Shelley **without** effect-first → baseline score
- Run each task with Shelley **with** effect-first (AGENTS.md wiring) → treatment score
- Publish the delta. If it's not significant, the content needs work, not more features.

### 1.3 Fix content gaps the benchmark reveals

Every benchmark failure becomes a content fix. This is the feedback loop.

---

## Phase 2: Cover real surface area

**Core Effect is necessary but not sufficient.** Real projects use the platform packages.

### 2.1 New content modules → new routes

| Route | Content |
|---|---|
| `/http-server` | @effect/platform HttpRouter, HttpServerResponse, middleware |
| `/http-client` | @effect/platform HttpClient, request building, response handling |
| `/sql` | @effect/sql patterns — Migrator, query builders, transactions |
| `/cli` | @effect/cli — Command, Options, Args, completions |
| `/streams` | Stream, Sink, Channel basics |

Each follows the same Diátaxis split: terse rules + reference + examples. No prose.

### 2.2 The index becomes a router

Update `/` to list all available modules with token costs. Agents fetch the index, then pull what's relevant to their task. The index is the API.

### 2.3 Composable reference

New route: `/bundle?modules=rules,http-server,sql` — returns a combined response. Agents that know their task can request exactly the right context in one fetch.

---

## Phase 3: More agents

Each agent platform has its own config mechanism. Examples for each:

| Agent | Config file | Status |
|---|---|---|
| Shelley | `AGENTS.md` | ✅ Done |
| Claude Code | `CLAUDE.md` | Next |
| Cursor | `.cursor/rules/*.mdc` | Planned |
| Codex | `AGENTS.md` | Planned (same as Shelley?) |
| Copilot | `.github/copilot-instructions.md` | Planned |
| Pi | `AGENTS.md` | Planned (github.com/badlogic/pi-mono) |
| Custom | Fetch in system prompt | Planned |

Each example is a working project (not just config), so people can see the output.

---

## Phase 4: Dynamic serving

### 4.1 Real token counts

Count tokens server-side (tiktoken or estimate), serve in index and as `X-Token-Count` header. Agents can make informed budget decisions.

### 4.2 Version-aware content

`/rules?version=3.19` vs `/rules?version=4.0` — when Effect ships breaking changes, the reference stays correct for both.

### 4.3 Accept header content negotiation

`Accept: application/json` returns structured JSON (for agents that prefer it). `text/plain` remains default.

---

## Phase 5: The pattern itself

If effect-first proves the concept, document how to build a skill endpoint for any framework:

- Token-aware content splitting
- Route-per-concern architecture
- Benchmark-driven content quality
- Agent config examples

Publish as a guide. Others build skill endpoints for React, Rust, Kubernetes, whatever. effect-first becomes the reference implementation of the pattern.

---

## Non-goals

- **Not a tutorial site.** Agents don't learn, they pattern-match.
- **Not documentation.** Effect has docs. This is a cheat code.
- **Not a chatbot.** No conversational interface. Plain text in, correct code out.
- **Not a code generator.** We improve the agent, not replace it.

## Metrics

- Benchmark score delta (with vs without effect-first)
- Token efficiency (quality per token spent)
- Agent coverage (how many platforms have working examples)
- Content coverage (% of Effect API surface represented)

## Next action

Build `bench/01-hello/` — the simplest possible benchmark task. If we can't prove a greeting program improves, nothing else matters.
