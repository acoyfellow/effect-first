```ts
// main.ts
import { Config, Context, Effect, Layer, NodeRuntime, Redacted, Schema } from "effect"

/**
 * =========================
 * Domain: Schemas + Brands
 * =========================
 */

const AppName = Schema.NonEmptyString.pipe(Schema.brand("AppName"))
type AppName = typeof AppName.Type

const UserName = Schema.NonEmptyString.pipe(Schema.brand("UserName"))
type UserName = typeof UserName.Type

class GreetingInput extends Schema.Class<GreetingInput>("GreetingInput")({
  userName: UserName,
}) {}

/**
 * =========================
 * Domain: Errors
 * =========================
 */

class InvalidInputError extends Schema.TaggedError<InvalidInputError>()(
  "InvalidInputError",
  {
    message: Schema.String,
  }
) {}

/**
 * =========================
 * Config Service
 * =========================
 */

class AppConfig extends Context.Tag("@app/AppConfig")<
  AppConfig,
  {
    readonly appName: AppName
    readonly adminToken: Redacted.Redacted
  }
>() {
  static readonly layer = Layer.effect(
    AppConfig,
    Effect.gen(function* () {
      const appName = yield* Schema.Config("APP_NAME", AppName)
      const adminToken = yield* Config.redacted("ADMIN_TOKEN")
      return AppConfig.of({ appName, adminToken })
    })
  )

  static readonly testLayer = Layer.succeed(
    AppConfig,
    AppConfig.of({
      appName: AppName.make("Test App"),
      adminToken: Redacted.make("test-token"),
    })
  )
}

/**
 * =========================
 * Greeting Service
 * =========================
 */

class Greeter extends Context.Tag("@app/Greeter")<
  Greeter,
  {
    readonly greet: (input: unknown) => Effect.Effect<string, InvalidInputError>
  }
>() {
  static readonly layer = Layer.effect(
    Greeter,
    Effect.gen(function* () {
      const config = yield* AppConfig

      const greet = Effect.fn("Greeter.greet")(function* (input: unknown) {
        const decoded = yield* Schema.decodeUnknown(GreetingInput)(input).pipe(
          Effect.mapError(
            (e) =>
              new InvalidInputError({
                message: `Invalid greeting input: ${Schema.formatErrorSync(e)}`,
              })
          )
        )

        return `Hello, ${decoded.userName}! Welcome to ${config.appName}.`
      })

      return Greeter.of({ greet })
    })
  )
}

/**
 * =========================
 * Program (entry point)
 * =========================
 */

const main = Effect.fn("main")(function* () {
  const greeter = yield* Greeter

  const good = yield* greeter
    .greet({ userName: "Ada" })
    .pipe(
      Effect.tap((msg) => Effect.logInfo(msg)),
      Effect.catchTag("InvalidInputError", (e) =>
        Effect.logWarning(`Handled InvalidInputError: ${e.message}`).pipe(
          Effect.as("Recovered from invalid input (good case should not hit this).")
        )
      )
    )

  yield* Effect.logInfo(`Result (good): ${good}`)

  const bad = yield* greeter
    .greet({ userName: "" }) // invalid: NonEmptyString
    .pipe(
      Effect.tap((msg) => Effect.logInfo(msg)),
      Effect.catchTag("InvalidInputError", (e) =>
        Effect.logWarning(`Handled InvalidInputError: ${e.message}`).pipe(
          Effect.as("Using fallback greeting due to invalid input.")
        )
      )
    )

  yield* Effect.logInfo(`Result (bad): ${bad}`)
})

/**
 * =========================
 * Layer wiring + runtime
 * =========================
 */

const appLayer = Greeter.layer.pipe(Layer.provideMerge(AppConfig.layer))

NodeRuntime.runMain(main.pipe(Effect.provide(appLayer)))
```
