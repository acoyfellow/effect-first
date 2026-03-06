import { Effect, Layer, ManagedRuntime, ServiceMap } from "effect"

class ClockService extends ServiceMap.Service<ClockService, {
  readonly now: Effect.Effect<string>
}>()("ClockService") {}

const ClockLive = Layer.succeed(ClockService)({
  now: Effect.succeed("now"),
})

const runtime = ManagedRuntime.make(ClockLive)

const program = Effect.gen(function* () {
  const clock = yield* ClockService
  return yield* clock.now
})

runtime.runPromise(program)
runtime.dispose()
