import { Config, Context, Effect, Layer, Schema } from "effect"
import { NodeRuntime } from "@effect/platform-node"

const AppName = Schema.String.pipe(Schema.brand("AppName"))
type AppName = typeof AppName.Type

class NameTooShortError extends Schema.TaggedError<NameTooShortError>()("NameTooShortError", {
  name: Schema.String,
  minLength: Schema.Number,
}) {}

class Greeting extends Schema.Class<Greeting>("Greeting")({
  message: Schema.String,
  recipient: Schema.String,
}) {}

class Greeter extends Context.Tag("@app/Greeter")<
  Greeter,
  { readonly greet: (name: string) => Effect.Effect<Greeting, NameTooShortError> }
>() {
  static readonly layer = Layer.effect(
    Greeter,
    Effect.gen(function* () {
      const appName = yield* Config.string("APP_NAME")
      return Greeter.of({
        greet: Effect.fn("Greeter.greet")(function* (name: string) {
          if (name.length < 2) {
            return yield* new NameTooShortError({ name, minLength: 2 })
          }
          return new Greeting({ message: `Hello, ${name} from ${appName}!`, recipient: name })
        }),
      })
    })
  )
}

const program = Effect.gen(function* () {
  const greeter = yield* Greeter
  const greeting = yield* greeter.greet("Ef").pipe(
    Effect.catchTag("NameTooShortError", (error) =>
      Effect.gen(function* () {
        yield* Effect.logError(`Name too short: ${error.name}`)
        return new Greeting({ message: "Fallback", recipient: error.name })
      })
    )
  )

  yield* Effect.logInfo(greeting.message)
})

NodeRuntime.runMain(program.pipe(Effect.provide(Greeter.layer)))
