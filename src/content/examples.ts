export const EXAMPLES_TEXT = `# Effect-First TypeScript — Code Examples

## Effect.fn — basic

    import { Effect } from "effect"

    const processUser = Effect.fn("processUser")(function* (userId: string) {
      const user = yield* getUser(userId)
      return yield* processData(user)
    })

## Effect.fn — with retry transform

    import { Effect, Schedule, flow } from "effect"

    const fetchWithRetry = Effect.fn("fetchWithRetry")(
      function* (url: string) {
        return yield* fetchData(url)
      },
      flow(
        Effect.retry(Schedule.exponential("100 millis").pipe(Schedule.compose(Schedule.recurs(3)))),
        Effect.timeout("5 seconds")
      )
    )

## Effect.gen — sequencing

    import { Effect } from "effect"

    const program = Effect.gen(function* () {
      const data = yield* fetchData
      yield* Effect.logInfo(\`Processing: \${data}\`)
      return yield* processData(data)
    })

## TaggedError — definition

    import { Schema } from "effect"

    class UserNotFoundError extends Schema.TaggedError<UserNotFoundError>()(
      "UserNotFoundError",
      { id: Schema.String }
    ) {}

    class RateLimitError extends Schema.TaggedError<RateLimitError>()(
      "RateLimitError",
      { retryAfter: Schema.Number }
    ) {}

## TaggedError — recovery

    const result = program.pipe(
      Effect.catchTag("UserNotFoundError", (e) => Effect.succeed(defaultUser)),
      Effect.catchTag("RateLimitError", (e) => Effect.fail(new FatalError({ cause: e })))
    )

    const safe = program.pipe(
      Effect.catchAll((error) => Effect.gen(function* () {
        yield* Effect.logError("Error", error)
        return fallback
      }))
    )

## Service — Context.Tag definition

    import { Context, Effect } from "effect"

    class Database extends Context.Tag("@app/Database")<
      Database,
      {
        readonly query: (sql: string) => Effect.Effect<unknown[]>
        readonly execute: (sql: string) => Effect.Effect<void>
      }
    >() {}

## Service — Layer implementation with dependencies

    import { Context, Effect, Layer } from "effect"

    class Users extends Context.Tag("@app/Users")<
      Users,
      {
        readonly findById: (id: UserId) => Effect.Effect<User, UserNotFoundError>
      }
    >() {
      static readonly layer = Layer.effect(
        Users,
        Effect.gen(function* () {
          const db = yield* Database
          const analytics = yield* Analytics

          const findById = Effect.fn("Users.findById")(function* (id: UserId) {
            yield* analytics.track("user.find", { id })
            const rows = yield* db.query(\`SELECT * FROM users WHERE id = '\${id}'\`)
            if (rows.length === 0) return yield* new UserNotFoundError({ id })
            return User.make(rows[0] as any)
          })

          return Users.of({ findById })
        })
      )
    }

## Schema — Class with branded ID

    import { Schema } from "effect"

    const UserId = Schema.String.pipe(Schema.brand("UserId"))
    type UserId = typeof UserId.Type

    class User extends Schema.Class<User>("User")({
      id: UserId,
      name: Schema.String,
      email: Schema.String,
      createdAt: Schema.Date,
    }) {
      get displayName() { return \`\${this.name} (\${this.email})\` }
    }

## Schema — branded primitives

    const Email = Schema.String.pipe(Schema.brand("Email"))
    type Email = typeof Email.Type

    const Port = Schema.Int.pipe(Schema.between(1, 65535), Schema.brand("Port"))
    type Port = typeof Port.Type

## Schema — tagged union + Match

    import { Match, Schema } from "effect"

    class Success extends Schema.TaggedClass<Success>()("Success", { value: Schema.Number }) {}
    class Failure extends Schema.TaggedClass<Failure>()("Failure", { error: Schema.String }) {}

    const Result = Schema.Union(Success, Failure)
    type Result = typeof Result.Type

    const render = (r: Result) =>
      Match.valueTags(r, {
        Success: ({ value }) => \`Got: \${value}\`,
        Failure: ({ error }) => \`Error: \${error}\`,
      })

## Schema — JSON encode/decode

    const MoveFromJson = Schema.parseJson(Move)

    // decode from JSON string
    const move = yield* Schema.decodeUnknown(MoveFromJson)(jsonString)

    // encode to JSON string
    const json = yield* Schema.encode(MoveFromJson)(move)

## Config — service layer with redacted secrets

    import { Config, Context, Effect, Layer, Redacted, Schema } from "effect"

    const Port = Schema.NumberFromString.pipe(Schema.int(), Schema.between(1, 65535), Schema.brand("Port"))
    type Port = typeof Port.Type

    class AppConfig extends Context.Tag("@app/AppConfig")<
      AppConfig,
      {
        readonly port: Port
        readonly apiKey: Redacted.Redacted
        readonly env: "development" | "staging" | "production"
      }
    >() {
      static readonly layer = Layer.effect(
        AppConfig,
        Effect.gen(function* () {
          const port   = yield* Schema.Config("PORT", Port)
          const apiKey = yield* Config.redacted("API_KEY")
          const env    = yield* Schema.Config("ENV", Schema.Literal("development", "staging", "production"))
          return AppConfig.of({ port, apiKey, env })
        })
      )

      static readonly testLayer = Layer.succeed(AppConfig, AppConfig.of({
        port: Port.make(3000),
        apiKey: Redacted.make("test-key"),
        env: "development",
      }))
    }

## Resilience — retry, timeout, span

    import { Effect, Schedule } from "effect"

    const retryPolicy = Schedule.exponential("100 millis").pipe(
      Schedule.compose(Schedule.recurs(3))
    )

    const resilient = callExternalApi.pipe(
      Effect.timeout("2 seconds"),
      Effect.retry(retryPolicy),
      Effect.timeout("10 seconds"),
      Effect.tap((data) => Effect.logInfo(\`Fetched: \${data}\`)),
      Effect.withSpan("callExternalApi")
    )

## Testing — per-test layer (preferred)

    import { expect, it } from "@effect/vitest"
    import { Effect } from "effect"

    it.effect("creates a user", () =>
      Effect.gen(function* () {
        const users = yield* Users
        const user = yield* users.findById(UserId.make("u-1"))
        expect(user.name).toBe("Alice")
      }).pipe(Effect.provide(Users.testLayer))
    )

## Testing — suite-shared layer

    it.layer(Users.testLayer)("users suite", (it) => {
      it.effect("finds user", () => Effect.gen(function* () {
        const users = yield* Users
        expect(yield* users.findById(UserId.make("u-1"))).toBeDefined()
      }))
    })

## Testing — in-memory test layer

    static readonly testLayer = Layer.sync(Users, () => {
      const store = new Map([["u-1", User.make({ id: UserId.make("u-1"), name: "Alice", email: "a@example.com", createdAt: new Date() })]])
      return Users.of({
        findById: (id) => Effect.succeed(store.get(id)!),
      })
    })

## Layer composition — entry point

    import { Layer, Effect } from "effect"

    const dbLayer = Postgres.layer({ url: "postgres://localhost/mydb", poolSize: 10 })

    const appLayer = UsersLayer.pipe(
      Layer.provideMerge(dbLayer),
      Layer.provideMerge(AnalyticsLayer),
      Layer.provideMerge(ConfigLayer)
    )

    Effect.runPromise(program.pipe(Effect.provide(appLayer)))

## Defect promotion — orDie at entry point

    const main = Effect.gen(function* () {
      const config = yield* loadConfig.pipe(Effect.orDie)
      yield* startServer(config)
    })
`
