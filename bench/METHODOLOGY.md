# effect-first v4 evaluation methodology

This document is the fixed explanation of how the effect-first benchmark works.

It is meant to answer three questions quickly:

1. What is being measured?
2. How do I reproduce it?
3. How do I audit that the published artifact is honest?

## Research question

Does the effect-first mechanism improve the quality of Effect v4 code compared with:

- a plain task prompt (`baseline`)
- direct access to source-on-disk without the website bootstrap (`direct-source-on-disk`)

The benchmark is designed to isolate the mechanism:

- the website acts only as the gateway
- the shared local `kit/` is the canonical guidance
- the benchmark compares those conditions explicitly

Current evidence only proves that the benchmark harness is reproducible and auditable. It does not yet prove that effect-first improves real model behavior.

## Experimental arms

- `baseline`
  - The task prompt only.
- `website-bootstrap-plus-kit`
  - The agent starts at `/bootstrap.txt`, then follows the shared `kit/` path.
- `direct-source-on-disk`
  - The agent gets equivalent direct local access to the same material, without the web bootstrap layer.

## Task design

The suite contains six fixed task classes:

1. service definition and consumption
2. tagged errors and targeted recovery
3. reusable runtime edges
4. multi-service composition
5. unstable surface isolation
6. end-to-end composition

Each task is a committed directory under `bench/`.

Each task commits:

- `prompt.md`
- `judge.ts`
- `baseline.ts`
- `website-bootstrap-plus-kit.ts`
- `direct-source-on-disk.ts`

## Scoring model

Each task judge is deterministic.

- Judges parse the TypeScript source into an AST using the TypeScript compiler API.
- Each judge checks a fixed set of structural properties.
- There is no model call, randomness, or hidden rubric inside the scorer.
- The artifact includes every individual check result.

Each output is also type-checked with TypeScript in strict `noEmit` mode.

The compile gate includes:

- `strict`
- `exactOptionalPropertyTypes`
- `noImplicitOverride`
- `noUnusedLocals`
- `noUnusedParameters`
- `skipLibCheck`
- `noEmit`

This creates two separate signals:

- structural pattern score
- compile pass/fail

## Reproduction

Regenerate the benchmark artifact:

```sh
npm run bench
```

Verify the committed artifacts exactly match the committed benchmark inputs:

```sh
npm run bench:verify
```

The benchmark is considered reproducible only when verification passes.

## Live protocol handoff

The seeded benchmark is not the decisive proof attempt.

The decisive live batch currently lives at:

- `bench/live/batches/001`

That batch is what can force the keep-or-kill decision.

Project-only blinded review can justify an internal keep-or-kill decision, not an external efficacy claim.

## Audit trail

The artifact stores:

- prompt file path
- prompt SHA-256
- judge file path
- judge SHA-256
- source file path per arm
- source SHA-256 per arm
- per-arm score
- per-arm compile status and diagnostics
- per-arm individual rule checks
- a top-level `sourceDigest`

This lets a reviewer verify:

- the exact inputs used
- the exact scorer used
- the exact outputs scored
- whether the published JSON drifted from the committed files

## Interpretation

- `summary.aggregate` is the average structural score per arm.
- `summary.compilePassCounts` shows how many of the committed outputs type-check.
- A higher structural score with equal or better compile counts is stronger evidence.

## Limits

- These are seeded committed outputs, not live model calls.
- The suite proves the scoring pipeline is reproducible, not that effect-first is already proven to improve live model behavior.
- The benchmark is only as strong as the task set; adding or changing tasks should be treated as a methodology change.

## Change control

Any change to:

- a prompt
- a judge
- a committed arm output
- the scoring code

must be followed by:

1. rerunning `npm run bench`
2. rerunning `npm run bench:verify`
3. reviewing the new artifact diff

If the artifact changes without those source changes, that is a bug.
