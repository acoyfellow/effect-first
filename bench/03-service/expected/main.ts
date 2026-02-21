import { Context, Effect, Layer } from "effect"
import { NodeRuntime } from "@effect/platform-node"

class Greeter extends Context.Tag("Greeter")<
  Greeter,
  { readonly greet: (name: string) => Effect.Effect<void> }
>() {
  static readonly layer = Layer.succeed(
    Greeter,
    Greeter.of({
      greet: Effect.fn("Greeter.greet")(function* (name: string) {
        yield* Effect.logInfo(`Hello, ${name}!`)
      }),
    })
  )
}

const program = Effect.gen(function* () {
  const greeter = yield* Greeter
  yield* greeter.greet("Effect")
})

NodeRuntime.runMain(program.pipe(Effect.provide(Greeter.layer)))
