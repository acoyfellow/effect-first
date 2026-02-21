# Benchmark results

Run: `bun bench/run.ts`

## Expected solutions

| Task | Score | Notes |
| --- | --- | --- |
| 01-hello | 57% | Missing TaggedError, Context/Layer, Schema.Class (not required by prompt). |
| 02-errors | 71% | Missing Schema.Class, Context/Layer (not required by prompt). |
| 03-service | 71% | Missing TaggedError, Schema.Class (not required by prompt). |
| 04-schema | 71% | Missing TaggedError, Context/Layer (not required by prompt). |
| 05-full-stack | 100% | All rules satisfied. |

## Observations

- Judges enforce a shared rule set across all tasks.
- Some tasks intentionally omit features that are scored, so expected solutions are below 100%.
- Use scores as a baseline; deltas are what matter for treatments.
