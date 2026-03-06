import { Effect, Layer, ManagedRuntime, Schedule, ServiceMap } from "effect"
import { HealthConfig, HealthConfigLive } from "./config.js"
import { HealthCheckError } from "./errors.js"

type HealthReport = {
  readonly url: string
  readonly status: "ok"
  readonly attempts: number
}

export class HealthChecker extends ServiceMap.Service<HealthChecker, {
  readonly check: Effect.Effect<HealthReport, HealthCheckError, HealthConfig>
}>()("HealthChecker") {}

export const HealthCheckerLive = Layer.succeed(HealthChecker)({
  check: Effect.gen(function* () {
    const config = yield* HealthConfig
    let attempts = 0

    const once = Effect.try({
      try: () => {
        attempts += 1
        if (!config.target.url.startsWith("https://")) {
          throw new Error("health target must be https")
        }

        return {
          url: config.target.url,
          status: "ok" as const,
          attempts,
        }
      },
      catch: (error) =>
        new HealthCheckError({
          message:
            error instanceof Error ? error.message : "health check execution failed",
        }),
    })

    return yield* once.pipe(
      Effect.retry(
        Schedule.compose(Schedule.exponential("5 millis"), Schedule.recurs(1))
      ),
      Effect.timeout(`${config.target.timeoutMs} millis`),
      Effect.catchTag("TimeoutError", () =>
        Effect.fail(new HealthCheckError({ message: "health check timed out" }))
      )
    )
  }),
})

export const runtimeLayer = Layer.mergeAll(HealthConfigLive, HealthCheckerLive)

export const monitorProgram = Effect.gen(function* () {
  const checker = yield* HealthChecker
  return yield* checker.check
})

export const makeRuntime = () => ManagedRuntime.make(runtimeLayer)
