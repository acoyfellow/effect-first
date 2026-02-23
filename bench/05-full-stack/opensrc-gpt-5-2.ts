```ts
// main.ts
import { Config, Context, Effect, Layer, Schema } from "effect"
import { NodeRuntime } from "@effect/platform-node"

// ---------------------------------------------
// Schemas + branded types
// ---------------------------------------------

// A branded "non-empty string"
const NonEmptyString = Schema.String.pipe(
  Schema.minLength(1),
  Schema.brand("NonEmptyString")
)
type NonEmptyString = Schema.Schema.Type<typeof NonEmptyString>

// Input schema using Schema.Class
class GreetInput extends Schema.Class<GreetInput>("GreetInput")({
  name: NonEmptyString
}) {}

// Config schema (also branded)
const AppName = Schema.String.pipe(
  Schema.minLength(1),
  Schema.brand("AppName")
)
type AppName = Schema.Schema.Type<typeof AppName>

// ---------------------------------------------
// Errors (at least one TaggedError)
// ---------------------------------------------

class InvalidInputError extends Schema.TaggedError<InvalidInputError>()(
  "InvalidInputError",
  {
    message: Schema.String
  }
) {}

class GreetingError extends Schema.TaggedError<GreetingError>()(
  "GreetingError",
  {
    message: Schema.String
  }
) {}

// ---------------------------------------------
// Config
// ---------------------------------------------

// Reads APP_NAME from environment and validates it with schema
const AppNameConfig = Config("APP_NAME", AppName)

// ---------------------------------------------
// Service + Tag + Layer
// ---------------------------------------------

interface Greeter {
  greet: (input: GreetInput) => Effect.Effect<string, GreetingError, never>
}

const Greeter = Context.Tag<Greeter>("Greeter")

const GreeterLive = Layer.effect(
  Greeter,
  Effect.gen(function* () {
    const appName = yield* AppNameConfig

    const greet: Greeter["greet"] = (input) =>
      Effect.fn("Greeter.greet")(function* () {
        // (Example business rule) reject a specific name
        if (input.name.toLowerCase() === "admin") {
          return yield* Effect.fail(
            new GreetingError({ message: "Refusing to greet reserved name 'admin'." })
          )
        }
        return `Hello, ${input.name}! — from ${appName}`
      })

    return { greet }
  })
)

// ---------------------------------------------
// Program
// ---------------------------------------------

const program = Effect.fn("program")(function* () {
  // Validate some "incoming" data (pretend this came from an API / CLI)
  const raw: unknown = { name: "World" }

  const input = yield* Schema.decodeUnknown(GreetInput)(raw).pipe(
    Effect.mapError(
      (e) =>
        new InvalidInputError({
          message: Schema.formatErrorSync(e)
        })
    )
  )

  const greeter = yield* Greeter
  const message = yield* greeter.greet(input)

  yield* Effect.log(message)
  return message
}).pipe(
  // Handle tagged errors
  Effect.catchTag("InvalidInputError", (e) =>
    Effect.logError(`Invalid input: ${e.message}`).pipe(Effect.as("invalid-input"))
  ),
  Effect.catchTag("GreetingError", (e) =>
    Effect.logError(`Greeting failed: ${e.message}`).pipe(Effect.as("greeting-failed"))
  )
)

// ---------------------------------------------
// Entry point: provide layers + run
// ---------------------------------------------

NodeRuntime.runMain(program.pipe(Effect.provide(GreeterLive)))
```

**How to run**
- Set `APP_NAME` in your environment (must be non-empty), e.g.:
  - `APP_NAME="MyApp" node dist/main.js`
  - or with tsx: `APP_NAME="MyApp" npx tsx main.ts`

This satisfies:
- `Schema.TaggedError` (`InvalidInputError`, `GreetingError`)
- `Schema.Class` (`GreetInput`)
- branded types (`NonEmptyString`, `AppName`)
- `Context.Tag` + `Layer` (`Greeter`, `GreeterLive`)
- `Effect.fn` and `Effect.gen`
- `Effect.catchTag`
- `Effect.provide` + `NodeRuntime.runMain` at entry point
