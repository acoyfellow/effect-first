import { Context, Effect, Layer } from "effect"
import { NameTooShortError } from "./errors.js"
import { Greeting, Name } from "./schema.js"

export class Greeter extends Context.Tag("@example/Greeter")<
  Greeter,
  {
    readonly greet: (name: string, shout: boolean) => Effect.Effect<Greeting, NameTooShortError>
  }
>() {
  static readonly layer = Layer.succeed(
    Greeter,
    Greeter.of({
      greet: Effect.fn("Greeter.greet")(function* (raw: string, shout: boolean) {
        if (raw.length < 2) {
          return yield* new NameTooShortError({ name: raw, minLength: 2 })
        }
        const name = raw as Name
        const message = shout
          ? `HELLO, ${name.toUpperCase()}!`
          : `Hello, ${name}.`
        yield* Effect.logInfo(`Greeting ${name} (shout=${shout})`)
        return new Greeting({ message, recipient: name, shout })
      }),
    })
  )

  static readonly testLayer = Layer.succeed(
    Greeter,
    Greeter.of({
      greet: Effect.fn("Greeter.greet")(function* (raw: string, shout: boolean) {
        if (raw.length < 2) {
          return yield* new NameTooShortError({ name: raw, minLength: 2 })
        }
        const name = raw as Name
        return new Greeting({
          message: shout ? `TEST: ${name.toUpperCase()}` : `Test: ${name}`,
          recipient: name,
          shout,
        })
      }),
    })
  )
}
