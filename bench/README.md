# effect-first v4 evals

This benchmark is designed to be easy to inspect, rerun, and verify.

Current evidence only proves that the benchmark harness is reproducible and auditable. It does not yet prove that effect-first improves real model behavior.

## What Makes It Reproducible

- Every task is committed in `bench/<task>/`.
- Every prompt is committed.
- Every judged output is committed.
- Every judge is committed.
- The score is deterministic.
- Each artifact includes SHA-256 hashes of the prompt, judge, and source files.
- Each source file is also type-checked with TypeScript strict `noEmit` settings, including unused local and parameter checks.
- The same final artifact is written to both `bench/results.json` and `kit/evals/results.json`.
- The required live-eval placeholder lives at `bench/live/results.json`.

## Commands

Generate the benchmark artifact:

```sh
npm run bench
```

Verify the committed artifacts exactly match the source files:

```sh
npm run bench:verify
```

Run the site tests plus benchmark verification:

```sh
npm test
```

Methodology:

- `bench/METHODOLOGY.md` is the fixed design and audit doc.
- `bench/IRON-CLAD-PLAN.md` is the truthfulness and promotion-gate document.
- `bench/live/PROTOCOL.md` is the required live evidence protocol.

Live pipeline:

- `npm run live:validate-batch`
- `npm run live:generate-capture-kit`
- `npm run live:build-review-packet`
- `npm run live:score-batch`
- `npm run live:decide`
- `npm run live:verify`

Current decisive batch:

- `bench/live/batches/001`

## How To Read The Artifact

- `summary.aggregate` is the high-level score per arm.
- `summary.compilePassCounts` shows how many task outputs compile per arm.
- Each task includes:
  - prompt file path + SHA
  - judge file path + SHA
  - per-arm score
  - per-arm compile pass/fail
  - per-arm individual rule checks
  - per-arm source file path + SHA

If the hashes, checks, or compile flags change, the verifier fails until `npm run bench` is rerun.

If the live protocol remains incomplete, the project must remain publicly unproven.
