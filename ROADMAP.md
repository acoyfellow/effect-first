# effect-first roadmap

## The thesis

Agents write bad Effect code by default. Their training data is overwhelmingly Promise/try-catch. Effect has strong opinions that diverge from "normal" TypeScript — and that's exactly why a skill endpoint works. The patterns are testable: code either uses `Effect.fn` or it doesn't, errors are either `Schema.TaggedError` or they're not.

If we can prove that a plain-text endpoint meaningfully improves agent output for Effect, the pattern is replicable for any opinionated framework.

## What we're building

A reference endpoint that makes agents write correct Effect-TS on the first try.

"Correct" means: compiles, follows all 9 rules, uses no anti-patterns, and a human reading the output says "this person knows Effect."

---

## Current state

| Phase | Status | Key evidence |
|---|---|---|
| 1 — Prove it works | ✅ Done | A/B benchmark: +24% on full-stack task (gpt-4o-mini) |
| 2 — Real surface area | ✅ Done | 11 content routes + `/bundle` compositor + `/full` |
| 3 — More agents | ✅ Done | 6 agent examples (Shelley, Claude Code, Cursor, Codex, Copilot, Pi) |
| 4 — Dynamic serving | 🔶 Partial | Token estimation + content negotiation done; version-aware content stubbed |
| 5 — The pattern itself | 🔶 Started | `PATTERN.md` (254 lines) exists; not yet published standalone |

### Key numbers

| Metric | Value |
|---|---|
| Benchmark delta (full-stack, gpt-4o-mini) | +24% (12/21 → 17/21) |
| Benchmark delta (service) | +44% (9/16 → 16/16) |
| Benchmark delta (schema) | +42% (7/12 → 12/12) |
| Content modules | 11 routes + bundle + full |
| Agent platform examples | 6 |
| Token estimation | Byte-based (~3.3 bytes/token), served via `X-Token-Count` header |

---

## Phase 1: Prove it works ✅

**Status: done.** Five benchmark tasks with AST-aware judges. A/B results published in `bench/AB-RESULTS.md`. The endpoint measurably improves agent output on non-trivial tasks.

### 1.1 Benchmark suite (`bench/`)

Five tasks of increasing complexity, all built:

| Task | Rules | Baseline | Treatment | Delta |
|---|---|---|---|---|
| `01-hello` | 8 | 100% | 100% | +0% |
| `02-errors` | 10 | 90% | 100% | +10% |
| `03-service` | 16 | 56% | 100% | +44% |
| `04-schema` | 12 | 58% | 100% | +42% |
| `05-full-stack` | 21 | 57% | 81% | +24% |

Each task has:
- `prompt.md` — what to ask the agent
- `judge.ts` — AST-aware conformance checker (regex + structural)
- `baseline.ts` / `treatment.ts` — generated output for scoring

Runner: `bun bench/run.ts`. A/B runner: `bun bench/ab.ts`.

### 1.2 Run the benchmark ✅

A/B results published in `bench/AB-RESULTS.md` (gpt-4o-mini). Trivial tasks show no delta; complex tasks show +13–38%. The endpoint matters most when the task requires multiple interacting patterns.

### 1.3 Fix content gaps the benchmark reveals ✅

Benchmark-driven iterations added: test file checks for `03-service`, `Schema.decodeUnknown` for `04-schema`, `Schema.brand` + `catchTag` + globally qualified tag ID + `testLayer` for `05-full-stack`. Tracked in `bench/RESULTS.md` "Observations".

---

## Phase 2: Cover real surface area ✅

**Status: done.** 11 content modules served, plus bundle compositor.

### 2.1 Content modules → routes ✅

Originally planned (all done):

| Route | Content |
|---|---|
| `/http-server` | HttpApi declarative server: endpoints, groups, handlers, security |
| `/http-client` | HttpClient service: GET/POST, schema decoding, HttpApiClient |
| `/sql` | @effect/sql: tagged template queries, SqlSchema, Model, SqlResolver |
| `/cli` | Command execution + CLI argument parsing |
| `/streams` | Stream, Sink, Channel: creation, transforms, consumption |

Added beyond plan:

| Route | Content |
|---|---|
| `/concurrency` | Fiber, Deferred, Queue, Pool, semaphore patterns |
| `/resources` | Scope, acquireRelease, ensuring, addFinalizer |
| `/anti-patterns` | "Never X → do Y" correction table |
| `/reference` | Imports, primitives, type signatures, quick-lookup tables |
| `/examples` | Copy-paste ready code patterns |
| `/full` | All modules concatenated |

All follow the same Diátaxis split: terse rules + reference + examples. No prose.

### 2.2 The index is a router ✅

`/` lists every module with estimated token cost and use-case guidance. Agents fetch the index, then pull what's relevant.

### 2.3 Composable reference ✅

`/bundle?modules=rules,http-server,sql` returns combined content. Invalid module names are silently skipped; empty request returns the valid module list.

---

## Phase 3: More agents ✅

**Status: done.** All six platforms have working example projects in `examples/`.

| Agent | Config file | Status |
|---|---|---|
| Shelley | `examples/shelley/AGENTS.md` | ✅ Done |
| Claude Code | `examples/claude-code/CLAUDE.md` | ✅ Done |
| Cursor | `examples/cursor/.cursor/rules/effect-first.mdc` | ✅ Done |
| Codex | `examples/codex/AGENTS.md` | ✅ Done |
| Copilot | `examples/copilot/.github/copilot-instructions.md` | ✅ Done |
| Pi | `examples/pi/AGENTS.md` | ✅ Done |

Each example is a working project (package.json, tsconfig.json, README, agent config).

---

## Phase 4: Dynamic serving ← NOW

### 4.1 Token counts ✅

Byte-based estimation (~3.3 bytes/token) served on every response via `X-Token-Count` header. JSON responses include `tokens` field. Index lists per-route estimates. Not tiktoken-precise, but functional.

### 4.2 Version-aware content 🔶

`?version=` parameter is parsed on all routes. `latest` and `3` are accepted; anything else returns 400. **No multi-version content exists yet** — when Effect 4.0 ships, this needs real branching.

### 4.3 Accept header content negotiation ✅

`Accept: application/json` → structured JSON (`{ ok, route, tokens, content }`). `Accept: text/html` → styled monospace HTML. `text/plain` is default. All three work on every route.

---

## Phase 5: The pattern itself 🔶

`PATTERN.md` (254 lines) documents the reusable pattern:

- Token-aware content splitting
- Route-per-concern architecture
- Benchmark-driven content quality
- Agent config examples

**Remaining:** publish as a standalone guide (blog post, docs site, or separate repo). Others build skill endpoints for React, Rust, Kubernetes, whatever. effect-first becomes the reference implementation of the pattern.

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

## Next actions

1. **Version-aware content (4.2)** — prepare content branches for Effect 4.0 when it ships.
2. **Publish the pattern (5)** — turn `PATTERN.md` into a standalone guide others can follow.
3. **More models in A/B** — benchmark against Claude, Gemini, and newer GPT models to validate across providers.
4. **Tiktoken-accurate counts (4.1)** — replace byte estimation with real tokenizer for budget-sensitive agents.
