```ts
// main.ts
import { Config, Context, Effect, Layer, Logger, Schema } from "effect"
import { NodeRuntime } from "@effect/platform-node"

// -----------------------------
// Schemas + branded types
// -----------------------------
type AppName = string & { readonly AppName: unique symbol }
const AppName = Schema.String.pipe(
  Schema.minLength(1),
  Schema.brand("AppName")
)

type UserName = string & { readonly UserName: unique symbol }
const UserName = Schema.String.pipe(
  Schema.minLength(1),
  Schema.pattern(/^[a-zA-Z][a-zA-Z0-9_-]*$/),
  Schema.brand("UserName")
)

// -----------------------------
// Errors (TaggedError required)
// -----------------------------
class InvalidInputError extends Schema.TaggedError<InvalidInputError>()(
  "InvalidInputError",
  {
    field: Schema.String,
    message: Schema.String
  }
) {}

class MissingConfigError extends Schema.TaggedError<MissingConfigError>()(
  "MissingConfigError",
  {
    key: Schema.String,
    message: Schema.String
  }
) {}

// -----------------------------
// Config service
// -----------------------------
class AppConfig extends Schema.Class<AppConfig>("AppConfig")({
  appName: AppName
}) {}

const AppConfigTag = Context.Tag<AppConfig>("AppConfig")

const AppConfigLive = Layer.effect(
  AppConfigTag,
  Effect.gen(function* () {
    // Load APP_NAME from env/config
    const raw = yield* Config.string("APP_NAME").pipe(
      Effect.mapError(
        (e) =>
          new MissingConfigError({
            key: "APP_NAME",
            message: `Missing or unreadable APP_NAME (${String(e)})`
          })
      )
    )

    // Validate + brand
    const appName = yield* Schema.decodeUnknown(AppName)(raw).pipe(
      Effect.mapError(
        () =>
          new MissingConfigError({
            key: "APP_NAME",
            message: "APP_NAME must be a non-empty string"
          })
      )
    )

    return new AppConfig({ appName })
  })
)

// -----------------------------
// Greeting service
// -----------------------------
interface Greeter {
  greet: (name: string) => Effect.Effect<string, InvalidInputError, never>
}

const GreeterTag = Context.Tag<Greeter>("Greeter")

const makeGreeter = Effect.fn(function* () {
  const cfg = yield* AppConfigTag

  const greet = (name: string) =>
    Schema.decodeUnknown(UserName)(name).pipe(
      Effect.mapError(
        () =>
          new InvalidInputError({
            field: "name",
            message:
              "Name must start with a letter and contain only letters, digits, '_' or '-'"
          })
      ),
      Effect.map((userName) => `Hello ${userName}! Welcome to ${cfg.appName}.`)
    )

  return { greet } satisfies Greeter
})

const GreeterLive = Layer.effect(GreeterTag, makeGreeter)

// -----------------------------
// Program
// -----------------------------
const program = Effect.gen(function* () {
  const greeter = yield* GreeterTag

  // Example inputs (one valid, one invalid)
  const inputs = ["alice_01", "!!!bad-name!!!"]

  for (const input of inputs) {
    const result = yield* greeter.greet(input).pipe(
      Effect.tap((msg) => Effect.logInfo(msg)),
      Effect.catchTag("InvalidInputError", (e) =>
        Effect.logWarning(`Invalid input (${e.field}): ${e.message}`)
      )
    )

    // `result` is `void` here because both branches log; keep it to show flow
    void result
  }
})

// -----------------------------
// Entry point: provide layers + runMain
// -----------------------------
program.pipe(
  Effect.provide(Layer.mergeAll(AppConfigLive, GreeterLive)),
  Effect.provide(Logger.pretty),
  NodeRuntime.runMain
)
```

**How to run**
- Set `APP_NAME` in your environment, e.g. `APP_NAME="MyApp" node main.ts` (or via your TS runner/bundler).
- You should see one successful greeting log and one handled `InvalidInputError` warning.
