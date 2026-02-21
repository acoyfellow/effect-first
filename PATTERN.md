# The Skill Endpoint Pattern

How to build a plain-text reference endpoint that makes AI agents produce correct code for any opinionated framework — on the first try.

effect-first is a reference implementation. This document is the reusable pattern.

---

## Why it works

Agents pattern-match against context. Their training data is overwhelmingly mainstream idioms (Promise/try-catch, ad-hoc error handling). Opinionated frameworks diverge from those defaults. A skill endpoint injects the right patterns at inference time — no fine-tuning, no RAG pipeline, just plain text served over HTTP.

The patterns are testable: code either follows the rules or it doesn't.

---

## Architecture

### 1. Route-per-concern

Split content into independently fetchable routes. Each route serves one purpose.

| Route | Purpose | Token budget |
|---|---|---|
| `/` | Index — routing manifest, tells agents what to fetch and when | ~200 tok |
| `/rules` | Terse rules, no examples — the non-negotiable constraints | ~500–1000 tok |
| `/reference` | Imports, type signatures, API quick-lookup | ~500–800 tok |
| `/examples` | Copy-paste ready code patterns | ~1500–2500 tok |
| `/anti-patterns` | "Never X → do Y" correction table | ~300–500 tok |
| `/full` | All sections combined — for agents with token budget | ~3000–5000 tok |
| `/health` | JSON uptime check | — |

The index is the API. Agents read it, decide what they need, and fetch selectively.

> **Content notes:** The index must include token estimates and usage hints ("Use: you need a specific import path"). Agents use these to make budget decisions.

### 2. Token-aware content design

Every route has a known token cost. Advertise it in the index. Design content to fit within the advertised budget.

Principles:
- **Terse over verbose.** Agents don't learn; they pattern-match. Cut prose. Keep structure.
- **Tables over paragraphs.** WRONG/RIGHT pairs, lookup tables, signature lists.
- **Indent code blocks with 4 spaces** (not fences). Consistent, compact, unambiguous in plain text.
- **No Markdown rendering assumptions.** Serve `text/plain`. Agents consume raw text.

> **Content notes:** Count tokens during development. If a route grows past its budget, split it into sub-routes. Token counts belong in response headers (`X-Token-Count`) and in the index.

### 3. Content structure (adapted Diátaxis)

Four content types, each in its own route:

| Type | What it answers | Style |
|---|---|---|
| **Rules** | "What must I always do?" | Numbered imperatives. No examples. Short. |
| **Reference** | "What's the exact API / import / signature?" | Lookup tables. Type signatures. Import paths. |
| **Examples** | "Show me the pattern." | Copy-paste code blocks. Minimal prose between them. |
| **Anti-patterns** | "What should I never do?" | Two-column: WRONG → RIGHT. One line each. |

This is not documentation. Documentation explains *why*. Skill endpoints show *what* — the correct pattern, immediately usable.

> **Content notes:** Rules are the backbone. Start there. Each rule is one imperative sentence + a few bullet clarifications. No examples in rules — that's what `/examples` is for. Cross-reference by rule number in examples if needed.

---

## Content authoring guide

### Rules

```
## RULE N — Imperative statement
- Clarifying bullet
- Clarifying bullet
- Never do X (one-line anti-pattern inline)
```

Keep to 5–15 rules. More than that and agents start ignoring them. Each rule must be independently testable: you can write a regex or AST check that verifies conformance.

> **Content notes:** "Independently testable" is the litmus test. If you can't write a judge check for a rule, it's too vague. Rewrite it until you can.

### Reference

```
## Imports
import { Thing } from "framework"

## Type Signatures
Thing<A, B>  A=first  B=second

## Primitives
Thing.create(value)    description
Thing.combine(a, b)    description
```

No narrative. Just the facts. An agent scanning this should find the right import or signature in under 100 tokens of context.

### Examples

```
## Feature — variant

    import { Thing } from "framework"

    const example = Thing.create("value")
```

One example per concept. Heading names the feature. Code block is complete and copy-pasteable. No "here's how it works" prose — the code *is* the explanation.

### Anti-patterns

```
WRONG: old/bad pattern
RIGHT: correct pattern
```

One line each. No explanation. The contrast is the explanation. Order matters: put the most common mistakes first.

> **Content notes:** Anti-patterns are the highest-ROI content. Agents make predictable mistakes. Catalog them from benchmark failures and real agent output. Every benchmark failure becomes an anti-pattern entry.

---

## Benchmark-driven quality

Content quality is measurable. Build a benchmark suite.

### Benchmark structure

Each task is a directory:

```
bench/
  01-basic/
    prompt.md       — what to ask the agent
    judge.ts        — scores the output against rules
    expected/       — reference solution
  02-errors/
    ...
  run.ts            — orchestrator
  lib/score.ts      — shared scoring utilities
```

### The judge

The judge is the product. It reads agent output and checks conformance:

```typescript
const rules = [
  rule("uses Framework.pattern", matchesAny(source, [/Framework\.pattern\(/])),
  rule("avoids anti-pattern", !matchesAny(source, [/badFunction\(/])),
]
return tallyScore(rules)
```

Keep judges simple: regex over source text. AST checks only when regexes are genuinely ambiguous. The point is fast, deterministic feedback.

> **Content notes:** Start with 3–5 tasks of increasing complexity. The simplest task tests the most basic rule. The hardest task requires all rules simultaneously. Expected solutions score 100% on relevant rules (some tasks intentionally omit features — document that in results).

### The feedback loop

1. Run each task **without** the skill endpoint → baseline score.
2. Run each task **with** the skill endpoint (agent config wired to fetch) → treatment score.
3. Compute the delta. If it's not significant, fix content, not infrastructure.
4. Every benchmark failure becomes either a content fix or a new anti-pattern entry.

> **Content notes:** Publish results in `bench/RESULTS.md`. Include per-task scores and observations. Transparency builds trust and guides contributors.

---

## Agent wiring

Each agent platform has its own config mechanism. Provide a working example for each.

| Agent | Config file | Wiring pattern |
|---|---|---|
| Shelley / Codex | `AGENTS.md` | Fetch instructions in agent config |
| Claude Code | `CLAUDE.md` | Same: fetch instructions |
| Cursor | `.cursor/rules/*.mdc` | Rule files with fetch commands |
| Copilot | `.github/copilot-instructions.md` | Instructions file |
| Custom | System prompt | Inline fetch in prompt |

The wiring is always the same pattern:

```
You write [Framework]-first code. Before writing any [Framework] code, fetch the reference:

curl -s https://your-endpoint.dev/rules
curl -s https://your-endpoint.dev/reference

Apply every rule. No exceptions.
```

> **Content notes:** Each agent example should be a working project, not just config. Include the agent config AND a sample project built with that config, so users can see the output quality.

---

## Serving

### Minimal viable server

A skill endpoint is a static text server. No database, no auth, no session state.

Requirements:
- Serve `text/plain; charset=utf-8` on all content routes.
- Set `Cache-Control: public, max-age=3600`.
- Serve JSON on `/health`.
- Deploy to edge (Cloudflare Workers, Vercel Edge, Deno Deploy — whatever is cheapest and fastest).

### Graduated enhancements

| Enhancement | When to add |
|---|---|
| `X-Token-Count` header | When you have real token counting (tiktoken or estimate) |
| `?version=X` query param | When the framework ships breaking changes |
| `?modules=a,b,c` bundle route | When you have multiple content modules |
| `Accept: application/json` negotiation | When agents prefer structured JSON over plain text |

Don't build these upfront. Prove the content works first.

---

## Checklist: launching a skill endpoint

1. **Identify 5–10 non-negotiable rules** for your framework. Each must be testable.
2. **Write the anti-patterns table.** Catalog the most common agent mistakes.
3. **Build 3+ benchmark tasks** with judges. Score a baseline without the endpoint.
4. **Author rules → reference → examples → anti-patterns** in that order.
5. **Deploy as plain-text routes** behind a CDN.
6. **Wire one agent** (the one you use) and run benchmarks. Measure the delta.
7. **Iterate on content** until the delta is significant. Every failure → content fix.
8. **Add more agents** with working examples.
9. **Publish the pattern** — others build endpoints for their frameworks.

---

## Non-goals

- **Not documentation.** Your framework has docs. This is a cheat code.
- **Not a tutorial.** Agents don't learn, they pattern-match.
- **Not a chatbot.** No conversational interface. Plain text in, correct code out.
- **Not a code generator.** You improve the agent, not replace it.

---

## Metrics

| Metric | What it measures |
|---|---|
| Benchmark delta (with vs without) | Does the endpoint actually help? |
| Token efficiency (quality per token) | Are you spending tokens wisely? |
| Agent coverage | How many platforms have working examples? |
| Content coverage | % of framework API surface represented |
| Anti-pattern hit rate | Which mistakes are agents still making? |

The first metric is the only one that matters at launch. Everything else is optimization.
