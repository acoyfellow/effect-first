import { Context, Effect, Layer } from "effect"
import { NodeRuntime } from "@effect/platform-node"

export class Clock extends Context.Tag("@app/Clock")<
  Clock,
  { readonly now: Effect.Effect<number> }
>() {
  static readonly layer = Layer.succeed(
    Clock,
    Clock.of({
      now: Effect.sync(() => Date.now()),
    })
  )

  static readonly testLayer = Layer.succeed(
    Clock,
    Clock.of({
      now: Effect.succeed(1700000000000),
    })
  )
}

const program = Effect.gen(function* () {
  const clock = yield* Clock
  const now = yield* clock.now
  yield* Effect.logInfo(`now=${now}`)
})

NodeRuntime.runMain(program.pipe(Effect.provide(Clock.layer)))
