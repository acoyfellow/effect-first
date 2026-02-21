# Benchmark results

Run: `bun bench/run.ts`

## Expected solutions

| Task | Score | Notes |
| --- | --- | --- |
| 01-hello | 100% | Task-specific rules (Effect.fn, Effect.gen, NodeRuntime.runMain). |
| 02-errors | 100% | Checks TaggedError + catchTag handling. |
| 03-service | 100% | Validates Context.Tag + Layer wiring for Clock service. |
| 04-schema | 100% | Validates Schema.Class + branded types + entry point. |
| 05-full-stack | 100% | Full stack rules enforced. |

## Observations

- Judges are task-specific; expected solutions should score 100%.
- Use scores as a baseline; deltas are what matter for treatments.
