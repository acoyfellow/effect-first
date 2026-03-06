import { Effect, Layer, ServiceMap } from "effect"

export class Greeter extends ServiceMap.Service<Greeter, {
  readonly greet: (name: string) => Effect.Effect<string>
}>()("Greeter") {}

export const GreeterLive = Layer.succeed(Greeter)({
  greet: (name) => Effect.succeed(`Codex says hello to ${name}`),
})

export const greet = (name: string) =>
  Effect.gen(function* () {
    const greeter = yield* Greeter
    return yield* greeter.greet(name)
  }).pipe(Effect.provide(GreeterLive))
