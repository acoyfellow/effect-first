import { Context, Effect, Layer, Schedule } from "effect"
import { MonitorConfig } from "./config.js"
import { EndpointUnreachableError, HealthDegradedError } from "./errors.js"
import { HealthReport, HealthResult } from "./schema.js"
import type { EndpointUrl, Milliseconds, Percentage } from "./schema.js"

// ── HealthChecker service ──────────────────────────────

export class HealthChecker extends Context.Tag("@example/HealthChecker")<
  HealthChecker,
  {
    readonly check: (
      url: EndpointUrl
    ) => Effect.Effect<HealthResult, EndpointUnreachableError>
    readonly runChecks: (
      url: EndpointUrl,
      count: number
    ) => Effect.Effect<
      HealthReport,
      EndpointUnreachableError | HealthDegradedError
    >
  }
>() {
  static readonly layer = Layer.effect(
    HealthChecker,
    Effect.gen(function* () {
      const config = yield* MonitorConfig

      // Retry schedule: exponential backoff capped at N retries (Rule 7)
      const retrySchedule = Schedule.exponential("100 millis").pipe(
        Schedule.compose(Schedule.recurs(config.retries))
      )

      // Raw check implementation
      const rawCheck = Effect.fn("HealthChecker.check")(
        function* (url: EndpointUrl) {
          const start = Date.now()

          // Simulate an HTTP check (real code would use HttpClient)
          const healthy = url.length > 0
          if (!healthy) {
            return yield* new EndpointUnreachableError({
              url,
              reason: "Empty URL",
            })
          }

          const latencyMs = (Date.now() - start) as Milliseconds
          const checkedAt = new Date().toISOString()

          yield* Effect.logInfo(`Health check: ${url} \u2192 OK (${latencyMs}ms)`)

          return new HealthResult({ url, healthy: true, latencyMs, checkedAt })
        }
      )

      // Wrap with retry + timeout, convert TimeoutException (Rule 7)
      const check = (url: EndpointUrl) =>
        rawCheck(url).pipe(
          Effect.retry(retrySchedule),
          Effect.timeout(`${config.timeoutMs} millis`),
          Effect.catchTag("TimeoutException", () =>
            new EndpointUnreachableError({ url, reason: "Timed out" })
          )
        )

      // Run N checks and produce an aggregate report
      const runChecks = Effect.fn("HealthChecker.runChecks")(
        function* (url: EndpointUrl, count: number) {
          const results: HealthResult[] = []

          for (let i = 0; i < count; i++) {
            const result = yield* check(url).pipe(
              Effect.catchTag("EndpointUnreachableError", (e) =>
                Effect.succeed(
                  new HealthResult({
                    url: e.url as EndpointUrl,
                    healthy: false,
                    latencyMs: 0 as Milliseconds,
                    checkedAt: new Date().toISOString(),
                  })
                )
              )
            )
            results.push(result)
          }

          const successCount = results.filter((r) => r.healthy).length
          const totalLatency = results.reduce(
            (sum, r) => sum + r.latencyMs,
            0
          )
          const avgLatencyMs = (
            results.length > 0 ? totalLatency / results.length : 0
          ) as Milliseconds
          const successRate = (
            results.length > 0
              ? (successCount / results.length) * 100
              : 0
          ) as Percentage

          yield* Effect.logInfo(
            `Report: ${successCount}/${results.length} passed (${successRate}%)`
          )

          if (successRate < config.degradedThreshold) {
            return yield* new HealthDegradedError({
              url,
              successRate,
              threshold: config.degradedThreshold,
            })
          }

          return new HealthReport({
            url,
            totalChecks: results.length,
            successCount,
            avgLatencyMs,
            successRate,
          })
        }
      )

      return HealthChecker.of({ check, runChecks })
    })
  )

  static readonly testLayer = Layer.effect(
    HealthChecker,
    Effect.gen(function* () {
      const config = yield* MonitorConfig
      let callCount = 0

      const check = Effect.fn("HealthChecker.check")(
        function* (url: EndpointUrl) {
          callCount++
          if (url === ("http://fail" as EndpointUrl)) {
            return yield* new EndpointUnreachableError({
              url,
              reason: "Simulated failure",
            })
          }
          return new HealthResult({
            url,
            healthy: true,
            latencyMs: 42 as Milliseconds,
            checkedAt: `2024-01-15T10:00:0${callCount}`,
          })
        }
      )

      const runChecks = Effect.fn("HealthChecker.runChecks")(
        function* (url: EndpointUrl, count: number) {
          const results: HealthResult[] = []

          for (let i = 0; i < count; i++) {
            const result = yield* check(url).pipe(
              Effect.catchTag("EndpointUnreachableError", (e) =>
                Effect.succeed(
                  new HealthResult({
                    url: e.url as EndpointUrl,
                    healthy: false,
                    latencyMs: 0 as Milliseconds,
                    checkedAt: `2024-01-15T10:00:0${i}`,
                  })
                )
              )
            )
            results.push(result)
          }

          const successCount = results.filter((r) => r.healthy).length
          const totalLatency = results.reduce(
            (sum, r) => sum + r.latencyMs,
            0
          )
          const avgLatencyMs = (
            results.length > 0 ? totalLatency / results.length : 0
          ) as Milliseconds
          const successRate = (
            results.length > 0
              ? (successCount / results.length) * 100
              : 0
          ) as Percentage

          if (successRate < config.degradedThreshold) {
            return yield* new HealthDegradedError({
              url,
              successRate,
              threshold: config.degradedThreshold,
            })
          }

          return new HealthReport({
            url,
            totalChecks: results.length,
            successCount,
            avgLatencyMs,
            successRate,
          })
        }
      )

      return HealthChecker.of({ check, runChecks })
    })
  ).pipe(Layer.provide(MonitorConfig.testLayer))
}
