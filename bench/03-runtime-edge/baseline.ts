import { Effect, ManagedRuntime } from "effect"

const runtime = ManagedRuntime.make(undefined as never)

const program = Effect.gen(function* () {
  return "ok"
})

runtime.runPromise(program)
runtime.dispose()
