import { Config, Context, Effect, Layer, Schema } from "effect"
import type { EndpointUrl, Milliseconds, Percentage } from "./schema.js"

// ── Config service (Rule 6) ──────────────────────────────

export class MonitorConfig extends Context.Tag("@example/MonitorConfig")<
  MonitorConfig,
  {
    readonly endpointUrl: EndpointUrl
    readonly timeoutMs: Milliseconds
    readonly retries: number
    readonly degradedThreshold: Percentage
  }
>() {
  static readonly layer = Layer.effect(
    MonitorConfig,
    Effect.gen(function* () {
      const endpointUrl = yield* Schema.Config(
        "MONITOR_URL",
        Schema.String.pipe(Schema.minLength(1))
      )
      const timeoutMs = yield* Config.number("MONITOR_TIMEOUT_MS").pipe(
        Config.withDefault(5000)
      )
      const retries = yield* Config.number("MONITOR_RETRIES").pipe(
        Config.withDefault(3)
      )
      const degradedThreshold = yield* Config.number(
        "MONITOR_DEGRADED_THRESHOLD"
      ).pipe(Config.withDefault(80))

      return MonitorConfig.of({
        endpointUrl: endpointUrl as EndpointUrl,
        timeoutMs: timeoutMs as Milliseconds,
        retries,
        degradedThreshold: degradedThreshold as Percentage,
      })
    })
  )

  static readonly testLayer = Layer.succeed(
    MonitorConfig,
    MonitorConfig.of({
      endpointUrl: "http://localhost:3000/health" as EndpointUrl,
      timeoutMs: 1000 as Milliseconds,
      retries: 2,
      degradedThreshold: 80 as Percentage,
    })
  )
}
