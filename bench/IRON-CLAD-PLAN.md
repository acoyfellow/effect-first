# iron-clad evidence plan

This is the decision document for effect-first.

## current status

Today, effect-first has harness-level evidence only.

That means:

- the seeded benchmark is reproducible
- the scoring pipeline is auditable
- the public artifact matches the committed source files

That does not mean:

- effect-first is proven to improve real model behavior
- the website bootstrap is proven to add causal lift in live runs
- the result generalizes beyond the seeded task set

## non-negotiable truth standard

The project must stand on its own without implying anything untrue.

Until the live protocol is complete, the only allowed public claim is:

"Current evidence only proves that the benchmark harness is reproducible and auditable. It does not yet prove that effect-first improves real model behavior."

## implementation checklist

1. Keep the seeded benchmark deterministic, versioned, and reproducible.
2. Keep the public artifact synchronized with the committed source files.
3. Publish the proof boundary directly in the artifact, docs, and website.
4. Maintain a committed live-eval placeholder artifact so missing evidence is explicit.
5. Maintain a written live protocol and blinded review checklist.
6. Refuse to promote the claim until all live promotion gates are satisfied.
7. If a stronger claim appears anywhere before the live protocol is complete, treat that as a bug.

Current decisive batch scaffold:

- `bench/live/batches/001`

## promotion gates

The project may only claim efficacy after all of the following are committed and verified:

- fixed model configurations
- raw transcripts
- holdout tasks
- all three comparison arms in every live run
- at least 3 trials per task
- blinded review
- at least 2 independent reviewers
- variance reporting

## decision rule

If the live protocol is completed under project-only reviewers, the strongest honest outcome is a provisional internal keep decision.

If the live protocol is not completed, the project remains unproven.

If harness-only evidence is not enough to justify the project, archive it.

If batch 001 misses its hard deadline or cannot reach a decided result, archive it.
