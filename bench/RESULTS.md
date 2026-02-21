# Benchmark results

Run: `bun bench/run.ts`

## Expected solutions

| Task | Score | Rules | Notes |
| --- | --- | --- | --- |
| 01-hello | 100% | 8 | Effect.fn, Effect.gen, NodeRuntime.runMain + 5 absence checks. |
| 02-errors | 100% | 10 | TaggedError, catchTag + 5 absence checks. |
| 03-service | 100% | 16 | Context.Tag, Layer.succeed, globally qualified tag ID, testLayer, test file with it.effect + 5 absence checks. |
| 04-schema | 100% | 12 | Schema.Class, brand, encode, decodeUnknown + 5 absence checks. |
| 05-full-stack | 100% | 21 | All rules: TaggedError, Class, brand, catchTag, Context.Tag, globally qualified tag ID, Layer, Config, resilience, it.effect, testLayer + 5 absence checks. |

## Observations

- Judges are task-specific; expected solutions should score 100%.
- Use scores as a baseline; deltas are what matter for treatments.
- Batch 3 added: test file checks for 03-service, Schema.decodeUnknown for 04-schema, Schema.brand + catchTag + tag ID + testLayer for 05-full-stack.
