import { Effect, Layer, ServiceMap } from "effect"
import { InvalidNameError } from "./errors.js"
import { decodeNameInput } from "./schema.js"

export class Greeter extends ServiceMap.Service<Greeter, {
  readonly greet: (name: string) => Effect.Effect<string, InvalidNameError>
}>()("Greeter") {}

export const GreeterLive = Layer.succeed(Greeter)({
  greet: (name) =>
    Effect.sync(() => decodeNameInput({ name })).pipe(
      Effect.flatMap(({ name }) =>
        name.trim().length === 0
          ? Effect.fail(new InvalidNameError({ reason: "name cannot be empty" }))
          : Effect.succeed(`Hello, ${name.trim()}!`)
      )
    ),
})

export const greet = (name: string) =>
  Effect.gen(function* () {
    const greeter = yield* Greeter
    return yield* greeter.greet(name)
  }).pipe(Effect.provide(GreeterLive))

export const greetOrFallback = (name: string) =>
  greet(name).pipe(
    Effect.catchTag("InvalidNameError", (error) =>
      Effect.succeed(`Fallback greeting (${error.reason})`)
    )
  )
