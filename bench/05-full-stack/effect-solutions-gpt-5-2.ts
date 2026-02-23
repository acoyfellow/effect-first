```ts
// main.ts
import { NodeRuntime } from "@effect/platform-node"
import { Config, Context, Effect, Layer, Schema } from "effect"

/**
 * =========================
 * Domain: branded primitives
 * =========================
 */
const AppName = Schema.NonEmptyString.pipe(Schema.brand("AppName"))
type AppName = typeof AppName.Type

const PersonName = Schema.NonEmptyString.pipe(Schema.brand("PersonName"))
type PersonName = typeof PersonName.Type

/**
 * =========================
 * Domain: models (Schema.Class)
 * =========================
 */
class Greeting extends Schema.Class<Greeting>("Greeting")({
  app: AppName,
  to: PersonName,
  message: Schema.String
}) {}

/**
 * =========================
 * Domain: errors (Schema.TaggedError)
 * =========================
 */
class InvalidNameError extends Schema.TaggedError<InvalidNameError>()(
  "InvalidNameError",
  {
    input: Schema.String,
    reason: Schema.String
  }
) {}

/**
 * =========================
 * Config service
 * =========================
 */
class AppConfig extends Context.Tag("@app/AppConfig")<
  AppConfig,
  { readonly appName: AppName }
>() {
  static readonly layer = Layer.effect(
    AppConfig,
    Effect.gen(function* () {
      // Reads from process.env.APP_NAME (and other Effect config providers if installed)
      const raw = yield* Config.string("APP_NAME")

      // Validate + brand
      const appName = yield* Schema.decodeUnknown(AppName)(raw)

      return AppConfig.of({ appName })
    })
  )
}

/**
 * =========================
 * Greeting service (Context.Tag + Layer)
 * =========================
 */
class Greeter extends Context.Tag("@app/Greeter")<
  Greeter,
  {
    readonly greet: (input: string) => Effect.Effect<Greeting, InvalidNameError>
  }
>() {
  static readonly layer = Layer.effect(
    Greeter,
    Effect.gen(function* () {
      const config = yield* AppConfig

      const validateName = Effect.fn("Greeter.validateName")(function* (input: string) {
        const trimmed = input.trim()

        if (trimmed.length === 0) {
          return yield* InvalidNameError.make({
            input,
            reason: "Name must be non-empty"
          })
        }

        // Brand it (runtime validation + type branding)
        return yield* Schema.decodeUnknown(PersonName)(trimmed)
      })

      const greet = Effect.fn("Greeter.greet")(function* (input: string) {
        const to = yield* validateName(input)
        const message = `Hello, ${to}! Welcome to ${config.appName}.`

        return Greeting.make({
          app: config.appName,
          to,
          message
        })
      })

      return Greeter.of({ greet })
    })
  )
}

/**
 * =========================
 * Program (Effect.gen + Effect.fn + catchTag)
 * =========================
 */
const program = Effect.fn("program")(function* () {
  const greeter = yield* Greeter

  // Example "input" (could come from CLI args, HTTP, etc.)
  const input = process.argv[2] ?? ""

  const greeting = yield* greeter.greet(input).pipe(
    Effect.catchTag("InvalidNameError", (e) =>
      Effect.gen(function* () {
        yield* Effect.logWarning(`Invalid input: "${e.input}" (${e.reason})`)
        // fallback value (still validated/branded)
        const fallback = yield* Schema.decodeUnknown(PersonName)("friend")
        const config = yield* AppConfig
        return Greeting.make({
          app: config.appName,
          to: fallback,
          message: `Hello, ${fallback}! (defaulted because input was invalid) Welcome to ${config.appName}.`
        })
      })
    )
  )

  yield* Effect.logInfo(greeting.message)
})

/**
 * =========================
 * Entry point: provide layers once + runMain
 * =========================
 */
const appLayer = Greeter.layer.pipe(Layer.provide(AppConfig.layer))

NodeRuntime.runMain(program.pipe(Effect.provide(appLayer)))
```

Usage:

```bash
APP_NAME="MyEffectApp" bun run main.ts Alice
APP_NAME="MyEffectApp" bun run main.ts "   "   # triggers InvalidNameError + fallback
```
