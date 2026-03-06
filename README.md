# effect-first

The prior effect-first website-layer claim is retired.

This repo is no longer positioning a public bootstrap website or any shared guidance bundle as an efficacy mechanism.

The active reset is smaller:

- keep the six runnable examples as code-on-disk references
- test one local-only hypothesis directly
- make no public efficacy claim until that smaller experiment is actually completed

## Current active surface

- `/` — archive/reset notice only
- `/health` — liveness check

The old routes (`/bootstrap.txt`, `/adopt`, `/evals`, `/evals.json`) are retired.

## What to use now

Start with:

1. `examples/`
2. `experiment/PROTOCOL.md`
3. `experiment/results.json`

The first restart experiment is:

- task: `todo-repo-local-only-001`
- arms: `baseline`, `local-only`
- trials: `3`
- metric: objective compile + test pass/fail
- strict rule: `local-only` must beat `baseline` on all 3 trials or the restart is `kill`

## Commands

```sh
npm install
npm run build
npm test
npm run experiment:report
```

## Current truth

- The previous website-layer claim was not established.
- The current local-only restart is defined but not yet run.
- There is no current public efficacy claim.
