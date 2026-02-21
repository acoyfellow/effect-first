import { Effect, Layer } from "effect"
import { NodeRuntime } from "@effect/platform-node"
import { MonitorConfig } from "./config.js"
import { HealthChecker } from "./health-checker.js"
import type { EndpointUrl } from "./schema.js"

const args = process.argv.slice(2)
const command = args[0]

const checkCommand = Effect.gen(function* () {
  const urlIdx = args.indexOf("--url")
  const url = urlIdx >= 0 ? args[urlIdx + 1] : undefined
  const countIdx = args.indexOf("--count")
  const count = countIdx >= 0 ? Number(args[countIdx + 1]) : 1

  if (!url) {
    yield* Effect.logError("Missing --url argument")
    return
  }

  const checker = yield* HealthChecker

  if (count <= 1) {
    const result = yield* checker.check(url as EndpointUrl).pipe(
      Effect.catchTag("EndpointUnreachableError", (e) =>
        Effect.gen(function* () {
          yield* Effect.logError(
            `Endpoint unreachable: ${e.url} (${e.reason})`
          )
          return yield* Effect.die(e)
        })
      )
    )
    yield* Effect.logInfo(
      `${result.url}: ${result.healthy ? "healthy" : "unhealthy"} (${result.latencyMs}ms)`
    )
  } else {
    const report = yield* checker.runChecks(url as EndpointUrl, count).pipe(
      Effect.catchTag("EndpointUnreachableError", (e) =>
        Effect.gen(function* () {
          yield* Effect.logError(
            `Endpoint unreachable: ${e.url} (${e.reason})`
          )
          return yield* Effect.die(e)
        })
      ),
      Effect.catchTag("HealthDegradedError", (e) =>
        Effect.gen(function* () {
          yield* Effect.logError(
            `Health degraded: ${e.url} at ${e.successRate}% (threshold: ${e.threshold}%)`
          )
          return yield* Effect.die(e)
        })
      )
    )
    yield* Effect.logInfo(
      `Report: ${report.successCount}/${report.totalChecks} passed, avg ${report.avgLatencyMs}ms, ${report.successRate}% success`
    )
  }
})

const program = Effect.gen(function* () {
  if (command === "check") {
    yield* checkCommand
  } else {
    yield* Effect.logInfo("Usage: cli check --url <url> [--count <n>]")
  }
})

const appLayer = HealthChecker.layer.pipe(
  Layer.provide(MonitorConfig.layer)
)

NodeRuntime.runMain(program.pipe(Effect.provide(appLayer)))
