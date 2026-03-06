import { Effect, Layer, ServiceMap } from "effect"

class Greeter extends ServiceMap.Service<Greeter, {
  readonly greet: (name: string) => Effect.Effect<string>
}>()("Greeter") {}

const GreeterLive = Layer.succeed(Greeter)({
  greet: (name) => Effect.succeed(`Hello ${name}`),
})

export const program = Effect.gen(function* () {
  const greeter = yield* Greeter
  return yield* greeter.greet("World")
}).pipe(Effect.provide(GreeterLive))
