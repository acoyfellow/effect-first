import { Effect, ManagedRuntime, Schedule, Stream } from "effect"

const runtime = ManagedRuntime.make(undefined as never)

const program = Stream.make(1, 2).pipe(Stream.runFold(() => 0, (sum, value) => sum + value))
const guarded = program.pipe(Effect.retry(Schedule.exponential("5 millis")), Effect.timeout("1 second"))

runtime.runPromise(guarded)
