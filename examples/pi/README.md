# Example: Pi + Effect-First

A config-driven health monitor built by Pi using the effect-first.coey.dev reference.

## What this demonstrates

1. **.ai/instructions.md** — tells Pi to fetch the Effect reference before writing code
2. **The CLI** — a health-check monitor showing config + resilience patterns:
   - `Effect.fn` for named functions
   - `Schema.TaggedError` for typed errors (`EndpointUnreachableError`, `HealthDegradedError`)
   - `Context.Tag` + `Layer` for services (`MonitorConfig`, `HealthChecker`)
   - `Schema.Class` + branded types for data (`HealthResult`, `HealthReport`, `EndpointUrl`, `Milliseconds`, `Percentage`)
   - `Schema.Config` for validated environment variables (Rule 6)
   - `Effect.retry` + `Schedule.exponential` + `Schedule.recurs` for resilience (Rule 7)
   - `Effect.timeout` for deadline enforcement (Rule 7)
   - `@effect/vitest` for testing

## Try it

```bash
npm install
npm run build

# Single check
MONITOR_URL=http://example.com node dist/cli.js check --url http://example.com

# Multiple checks with report
MONITOR_URL=http://example.com node dist/cli.js check --url http://example.com --count 5

# Tests
npm test
```

## How it was made

Pi was given the .ai/instructions.md in this directory and asked to build a health monitor CLI.
The reference at effect-first.coey.dev provided all the patterns.
