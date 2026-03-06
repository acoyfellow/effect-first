import { Effect, Layer, ManagedRuntime, Schedule, ServiceMap, Stream } from "effect"

class Metrics extends ServiceMap.Service<Metrics, {
  readonly collect: Effect.Effect<number>
}>()("Metrics") {}

const MetricsLive = Layer.succeed(Metrics)({
  collect: Stream.make(1, 2, 3).pipe(
    Stream.runFold(() => 0, (sum, value) => sum + value)
  ),
})

const runtime = ManagedRuntime.make(MetricsLive)

const program = Effect.gen(function* () {
  const metrics = yield* Metrics
  return yield* metrics.collect
}).pipe(
  Effect.retry(Schedule.exponential("5 millis")),
  Effect.timeout("1 second")
)

runtime.runPromise(program)
