import { Data, Effect, Layer, ServiceMap } from "effect"

class InvalidNameError extends Data.TaggedError("InvalidNameError")<{
  readonly reason: string
}> {}

class Greeter extends ServiceMap.Service<Greeter, {
  readonly greet: (name: string) => Effect.Effect<string, InvalidNameError>
}>()("Greeter") {}

const GreeterLive = Layer.succeed(Greeter)({
  greet: (name) =>
    name.trim().length === 0
      ? Effect.fail(new InvalidNameError({ reason: "blank" }))
      : Effect.succeed(`Hello ${name}`),
})

export const program = Effect.gen(function* () {
  const greeter = yield* Greeter
  return yield* greeter.greet("World")
}).pipe(Effect.provide(GreeterLive))
