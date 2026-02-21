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

## How to test your skill endpoint

Your skill endpoint is a product. Products need tests — not just unit tests on routes, but end-to-end evidence that the content actually changes agent behavior.

### The A/B benchmark approach

The core idea: run the same prompt twice — once without the skill endpoint (baseline), once with it (treatment) — and compare scores.

```
bench/
  01-hello/
    prompt.md       — task description for the agent
    judge.ts        — deterministic scoring function
    expected/       — reference solution (must score 100%)
    baseline.ts     — raw agent output WITHOUT the skill endpoint
    treatment.ts    — raw agent output WITH the skill endpoint
  run.ts            — orchestrator: imports judges, runs them, tallies results
  lib/score.ts      — shared utilities: rule(), tallyScore(), matchesAny()
  lib/rules.ts      — helpers: ruleAbsent() for anti-pattern checks
  AB-RESULTS.md     — published A/B deltas per task
```

#### Step 1: Write the prompt

Each task gets a `prompt.md` — a plain-English description of what the agent should build. Include explicit requirements so the judge has something to check:

```markdown
# Task 04: Schema Validation

Build a Schema-based validation module.

Requirements:
- Use Schema.Class for domain types.
- Use Schema.brand for branded types.
- Use Schema.decodeUnknown for parsing.
- No Zod, no io-ts, no manual validation.
```

#### Step 2: Build the judge

The judge is a pure function: source text in, score out. Keep it simple — regex over source text. AST parsing only when regex is genuinely ambiguous.

```typescript
import { rule, tallyScore, matchesAny } from "../lib/score.js"
import { ruleAbsent } from "../lib/rules.js"

// Positive rules: patterns that MUST appear
rule("uses Schema.Class", matchesAny(source, [/Schema\.Class/]))
rule("uses Schema.brand", matchesAny(source, [/Schema\.brand/]))

// Negative rules: patterns that must NOT appear
ruleAbsent("no manual validation", source, [/typeof\s+\w+\s*===/, /instanceof/])
ruleAbsent("no try/catch", source, [/\btry\b/, /\bcatch\b/])

return tallyScore(rules)
```

Scoring utilities:

| Utility | Purpose |
|---|---|
| `rule(name, bool)` | Create a named rule result |
| `matchesAny(source, patterns)` | True if any regex/string matches |
| `ruleAbsent(name, source, patterns)` | True if NO pattern matches (anti-pattern check) |
| `tallyScore(rules)` | Count passes, compute percentage |

#### Step 3: Collect baseline and treatment outputs

1. **Baseline.** Give the agent the prompt with no skill endpoint in context. Save its raw output to `baseline.ts`.
2. **Treatment.** Give the same agent the same prompt, but wire the skill endpoint into its system prompt. Save raw output to `treatment.ts`.
3. **Expected.** Write the ideal solution by hand. Place it in `expected/`. It must score 100% against the judge — if it doesn't, your judge has a bug.

#### Step 4: Run and compare

```bash
bun bench/run.ts
```

The orchestrator imports each judge, runs it against `expected/`, and reports scores. For A/B comparison, run the judge against both `baseline.ts` and `treatment.ts` artifacts.

Publish results in `bench/AB-RESULTS.md`:

```markdown
| Task           | Baseline     | Treatment     | Delta |
| ---            | ---          | ---           | ---   |
| 01-hello       | 100% (8/8)   | 100% (8/8)   | +0%   |
| 03-service     | 75% (12/16)  | 88% (14/16)  | +13%  |
| 05-full-stack  | 48% (10/21)  | 86% (18/21)  | +38%  |
```

#### Step 5: Close the feedback loop

Every benchmark failure becomes one of:

- **A content fix.** The endpoint didn't mention the pattern. Add it to rules/examples/anti-patterns.
- **A new anti-pattern entry.** The agent made a predictable mistake. Catalog it as WRONG → RIGHT.
- **A judge refinement.** The judge was too strict or too loose. Adjust the regex.

Run again. Repeat until the treatment delta is significant across all tasks.

> **Key principle:** If the delta is small, fix content — not infrastructure. The benchmark exists to make content quality measurable.

---

## Content negotiation

A skill endpoint primarily serves `text/plain`. But different consumers have different needs. Use the `Accept` header to serve the right format without separate routes.

### Supported formats

| Accept header | Response format | Content-Type | Use case |
|---|---|---|---|
| `text/plain` (default) | Raw text | `text/plain; charset=utf-8` | AI agents, curl, scripts |
| `text/html` | Styled `<pre>` wrapper | `text/html; charset=utf-8` | Browser preview, human readers |
| `application/json` | JSON envelope | `application/json` | Programmatic consumers, dashboards |

### Negotiation logic

The server inspects the `Accept` header on every content route and responds accordingly:

```
Accept: text/plain     →  raw text (the default, and the primary audience)
Accept: text/html      →  HTML page wrapping the text in <pre> with minimal CSS
Accept: application/json →  JSON envelope with metadata
(no Accept header)     →  text/plain
```

Priority: `text/html` > `application/json` > `text/plain`. If the client sends `Accept: text/html`, always serve HTML — even if `application/json` is also present. This ensures browsers always get a readable page.

### The JSON envelope

When `Accept: application/json` is present (and `text/html` is not), wrap the content in a structured envelope:

```json
{
  "ok": true,
  "route": "/rules",
  "tokens": 842,
  "content": "RULE 1 — Use Effect.fn for all named functions..."
}
```

| Field | Type | Description |
|---|---|---|
| `ok` | boolean | Always `true` for successful responses |
| `route` | string | The canonical route path |
| `tokens` | number | Estimated token count for the content |
| `content` | string | The full text content (same as text/plain body) |

This is useful for agents or tooling that want metadata alongside the content — especially the token count — without parsing headers.

### The HTML wrapper

For browser visitors, wrap the plain text in a minimal, readable HTML page:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>effect-first</title>
  <style>
    body { margin:2rem auto; max-width:80ch;
           font:14px/1.6 monospace; background:#0d1117; color:#c9d1d9 }
    a { color:#58a6ff }
    pre { white-space:pre-wrap; word-wrap:break-word }
  </style>
</head>
<body><pre>{{escaped content}}</pre></body>
</html>
```

The content is HTML-escaped (`&`, `<`, `>`) and placed inside `<pre>` tags. No Markdown rendering, no JavaScript, no external dependencies. The page is self-contained and loads instantly.

### Shared headers

All formats include the same cache and metadata headers:

```
Cache-Control: public, max-age=3600
X-Token-Count: 842
```

### Implementation pattern

Content negotiation belongs in a single `textResponse` helper that all routes share:

```typescript
const textResponse = (text: string, status = 200) =>
  Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest
    const accept = request.headers["accept"] ?? ""
    const wantJson = accept.includes("application/json") && !accept.includes("text/html")
    const wantHtml = accept.includes("text/html")
    const tokens = estimateTokens(text)

    if (wantJson) return yield* HttpServerResponse.json({ ok: true, route, tokens, content: text })
    const body = wantHtml ? wrapHtml(text) : text
    return HttpServerResponse.text(body, {
      contentType: wantHtml ? "text/html; charset=utf-8" : "text/plain; charset=utf-8",
      headers: { "Cache-Control": "public, max-age=3600", "X-Token-Count": String(tokens) },
    })
  })
```

Every content route calls `textResponse(TEXT_CONSTANT)`. Negotiation is centralized, consistent, and invisible to the content layer.

### When to add content negotiation

Don't build this on day one. The priority order:

1. **text/plain** — Ship this first. It's the entire point.
2. **HTML wrapper** — Add when you (or users) want to preview content in a browser.
3. **JSON envelope** — Add when programmatic consumers need token counts or metadata.

Content negotiation is a graduated enhancement. Start with plain text serving `text/plain; charset=utf-8` on every route. Layer in HTML and JSON when there's a real consumer for them.

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
