import { it } from "@effect/vitest"
import { Effect } from "effect"
import { expect } from "vitest"
import { HealthChecker } from "./health-checker.js"
import type { EndpointUrl } from "./schema.js"

it.effect("checks a healthy endpoint", () =>
  Effect.gen(function* () {
    const checker = yield* HealthChecker
    const result = yield* checker.check(
      "http://localhost:3000/health" as EndpointUrl
    )
    expect(result.healthy).toBe(true)
    expect(result.latencyMs).toBe(42)
    expect(result.url).toBe("http://localhost:3000/health")
  }).pipe(Effect.provide(HealthChecker.testLayer))
)

it.effect("returns EndpointUnreachableError for failing endpoint", () =>
  Effect.gen(function* () {
    const checker = yield* HealthChecker
    const result = yield* checker
      .check("http://fail" as EndpointUrl)
      .pipe(Effect.flip)
    expect(result._tag).toBe("EndpointUnreachableError")
    expect(result.url).toBe("http://fail")
    expect(result.reason).toBe("Simulated failure")
  }).pipe(Effect.provide(HealthChecker.testLayer))
)

it.effect("runs multiple checks and produces a report", () =>
  Effect.gen(function* () {
    const checker = yield* HealthChecker
    const report = yield* checker.runChecks(
      "http://localhost:3000/health" as EndpointUrl,
      3
    )
    expect(report.totalChecks).toBe(3)
    expect(report.successCount).toBe(3)
    expect(report.successRate).toBe(100)
    expect(report.avgLatencyMs).toBe(42)
  }).pipe(Effect.provide(HealthChecker.testLayer))
)

it.effect(
  "returns HealthDegradedError when success rate is below threshold",
  () =>
    Effect.gen(function* () {
      const checker = yield* HealthChecker
      const result = yield* checker
        .runChecks("http://fail" as EndpointUrl, 3)
        .pipe(Effect.flip)
      expect(result._tag).toBe("HealthDegradedError")
      if (result._tag === "HealthDegradedError") {
        expect(result.successRate).toBe(0)
        expect(result.threshold).toBe(80)
      }
    }).pipe(Effect.provide(HealthChecker.testLayer))
)

it.effect("report has correct averages over many checks", () =>
  Effect.gen(function* () {
    const checker = yield* HealthChecker
    const report = yield* checker.runChecks(
      "http://localhost:3000/health" as EndpointUrl,
      5
    )
    expect(report.totalChecks).toBe(5)
    expect(report.successCount).toBe(5)
    expect(report.avgLatencyMs).toBe(42)
    expect(report.successRate).toBe(100)
  }).pipe(Effect.provide(HealthChecker.testLayer))
)
