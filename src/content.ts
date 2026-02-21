export const GUIDE_TEXT = `# Effect-First TypeScript — Agent Reference

You write Effect-first TypeScript. Every effectful operation uses the Effect runtime. You never reach for plain Promise, try/catch, or ad-hoc error types. This document is your complete playbook.

---

## Core Mental Model

Effect programs are values. \`Effect<A, E, R>\` means:
- A — the success type
- E — the typed error (what callers can recover from)
- R — the required services (dependency graph)

You compose these values using \`Effect.gen\` / \`yield*\`, \`.pipe()\`, and \`Layer\` wiring. You never run effects until the application entry point.

---

## RULE 1 — Always use \`Effect.fn\` for named effectful functions

\`Effect.fn\` wraps a generator and adds call-site tracing, span integration, and a clean signature. Use it for every named effectful function, including nullary thunks.

    import { Effect } from "effect"

    // correct
    const processUser = Effect.fn("processUser")(function* (userId: string) {
      const user = yield* getUser(userId)
      return yield* processData(user)
    })

    // correct — second arg transforms the entire effect (retries, timeouts, etc.)
    import { flow, Schedule } from "effect"

    const fetchWithRetry = Effect.fn("fetchWithRetry")(
      function* (url: string) {
        return yield* fetchData(url)
      },
      flow(
        Effect.retry(Schedule.exponential("100 millis").pipe(Schedule.compose(Schedule.recurs(3)))),
        Effect.timeout("5 seconds")
      )
    )

    // never use plain async functions for effectful code
    // async function processUser(userId: string) { ... }

---

## RULE 2 — Always use \`Effect.gen\` for sequencing

    import { Effect } from "effect"

    const program = Effect.gen(function* () {
      const data = yield* fetchData
      yield* Effect.logInfo(\`Processing: \${data}\`)
      return yield* processData(data)
    })

---

## RULE 3 — Model all errors as \`Schema.TaggedError\`

Typed errors are serializable, matchable, and composable. Never throw raw strings or plain Error objects.

    import { Schema } from "effect"

    class UserNotFoundError extends Schema.TaggedError<UserNotFoundError>()(
      "UserNotFoundError",
      { id: Schema.String }
    ) {}

    class RateLimitError extends Schema.TaggedError<RateLimitError>()(
      "RateLimitError",
      { retryAfter: Schema.Number }
    ) {}

    // Recover by tag
    const result = program.pipe(
      Effect.catchTag("UserNotFoundError", (e) => Effect.succeed(defaultUser)),
      Effect.catchTag("RateLimitError", (e) => Effect.fail(new FatalError({ cause: e })))
    )

    // Recover all
    const safe = program.pipe(
      Effect.catchAll((error) => Effect.gen(function* () {
        yield* Effect.logError("Error", error)
        return fallback
      }))
    )

Typed errors (E channel) vs Defects:
- Use E for domain failures callers can meaningfully handle: not found, validation, permission denied, rate limits.
- Use defects (Effect.die, Effect.orDie) for bugs and invariant violations — unrecoverable, handled once at the system boundary.

    // At app entry: config failure is unrecoverable, promote to defect
    const main = Effect.gen(function* () {
      const config = yield* loadConfig.pipe(Effect.orDie)
      yield* startServer(config)
    })

---

## RULE 4 — Model all services as \`Context.Tag\` + \`Layer\`

Defining a service:

    import { Context, Effect, Layer } from "effect"

    class Database extends Context.Tag("@app/Database")<
      Database,
      {
        readonly query: (sql: string) => Effect.Effect<unknown[]>
        readonly execute: (sql: string) => Effect.Effect<void>
      }
    >() {}

Rules:
- Tag identifiers must be globally unique — use @scope/Name pattern.
- Service methods have R = never. Dependencies are resolved via Layer, not method signatures.
- Use readonly on all properties.

Implementing a service as a Layer:

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

Layer naming: layer, testLayer, postgresLayer, sqliteLayer — camelCase with Layer suffix.

Composing layers at the entry point:

    import { Layer, Effect } from "effect"

    // Store parameterized layers in constants — Effect memoizes by reference identity
    const dbLayer = Postgres.layer({ url: "postgres://localhost/mydb", poolSize: 10 })

    const appLayer = UsersLayer.pipe(
      Layer.provideMerge(dbLayer),
      Layer.provideMerge(AnalyticsLayer),
      Layer.provideMerge(ConfigLayer)
    )

    // Provide once at the entry point. Never scatter .provide() throughout code.
    Effect.runPromise(program.pipe(Effect.provide(appLayer)))

Layer memoization rule: When using parameterized layer constructors (like Postgres.layer(...)), always assign to a module-level constant before referencing in multiple places. Two calls to the same constructor create two independent instances (two connection pools, etc.).

---

## RULE 5 — Model all data with \`Schema\`

Schema is the single source of truth for types, runtime validation, and JSON serialization.

Records (AND types):

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

Variants (OR types):

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

Branded types — brand nearly all domain primitives:

    const Email = Schema.String.pipe(Schema.brand("Email"))
    type Email = typeof Email.Type

    const Port = Schema.Int.pipe(Schema.between(1, 65535), Schema.brand("Port"))
    type Port = typeof Port.Type

JSON encode/decode:

    const MoveFromJson = Schema.parseJson(Move)

    // decode from JSON string
    const move = yield* Schema.decodeUnknown(MoveFromJson)(jsonString)

    // encode to JSON string
    const json = yield* Schema.encode(MoveFromJson)(move)

---

## RULE 6 — Config via \`Schema.Config\` and config service layers

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
          const port    = yield* Schema.Config("PORT", Port)
          const apiKey  = yield* Config.redacted("API_KEY")
          const env     = yield* Schema.Config("ENV", Schema.Literal("development", "staging", "production"))
          return AppConfig.of({ port, apiKey, env })
        })
      )

      static readonly testLayer = Layer.succeed(AppConfig, AppConfig.of({
        port: Port.make(3000),
        apiKey: Redacted.make("test-key"),
        env: "development",
      }))
    }

Rules:
- Always use Config.redacted() for secrets. It hides values in logs automatically.
- Use Schema.Config (not raw Config.string) when validation or branding is needed.
- Group related config into a single Config service layer. Business logic depends on the service, not on raw Config primitives.

---

## RULE 7 — Resilience: retry, timeout, and pipe instrumentation

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

Common .pipe() instrumentation: Effect.timeout, Effect.retry, Effect.tap, Effect.withSpan, Effect.annotateCurrentSpan.

---

## RULE 8 — Testing with \`@effect/vitest\`

    import { expect, it } from "@effect/vitest"
    import { Effect } from "effect"

    // Per-test layering (preferred — no state leakage)
    it.effect("creates a user", () =>
      Effect.gen(function* () {
        const users = yield* Users
        const user = yield* users.findById(UserId.make("u-1"))
        expect(user.name).toBe("Alice")
      }).pipe(Effect.provide(Users.testLayer))
    )

    // Suite-shared layering (only for expensive shared resources like DB connections)
    it.layer(Users.testLayer)("users suite", (it) => {
      it.effect("finds user", () => Effect.gen(function* () {
        const users = yield* Users
        expect(yield* users.findById(UserId.make("u-1"))).toBeDefined()
      }))
    })

Test implementations use Layer.sync with in-memory state:

    static readonly testLayer = Layer.sync(Users, () => {
      const store = new Map([["u-1", User.make({ id: UserId.make("u-1"), name: "Alice", email: "a@example.com", createdAt: new Date() })]])
      return Users.of({
        findById: (id) => Effect.succeed(store.get(id)!),
      })
    })

---

## RULE 9 — Service-driven development workflow

1. Sketch leaf services — define Context.Tag contracts with no implementations.
2. Write orchestration — higher-level services yield* leaf tags. This compiles and type-checks immediately.
3. Implement leaf layers — fill in production Layer implementations.
4. Wire at entry point — compose all layers into appLayer, provide once.

This means you can write and type-check the full business logic before any I/O layer exists.

---

## TypeScript config (non-negotiable)

    {
      "compilerOptions": {
        "target": "ES2022",
        "module": "NodeNext",
        "moduleDetection": "force",
        "verbatimModuleSyntax": true,
        "rewriteRelativeImportExtensions": true,
        "strict": true,
        "exactOptionalPropertyTypes": true,
        "noUnusedLocals": true,
        "noImplicitOverride": true,
        "declarationMap": true,
        "sourceMap": true,
        "skipLibCheck": true
      }
    }

---

## Anti-patterns — never do these

  async function foo()                   -> Effect.fn("foo")(function* () { ... })
  try { } catch (e) { }                  -> Effect.catchTag / Effect.catchAll
  throw new Error(...)                   -> yield* new MyTaggedError({ ... }) or Effect.fail(...)
  Raw Promise in service methods         -> Effect.Effect<A, E> return types
  Calling Postgres.layer(...) twice      -> Assign to a const first, share the reference
  Scattered Effect.provide(...) calls    -> Provide once at entry point via composed appLayer
  Config.string("X") for validated vals  -> Schema.Config("X", MySchema)
  console.log(secret)                    -> Config.redacted("SECRET") — logs as <redacted>
  Unbranded primitives (string for IDs)  -> Schema.String.pipe(Schema.brand("UserId"))
  Effect.provide inside service methods  -> Layer composition handles dependencies

---

## Quick reference — key imports

    import { Effect, Layer, Context, Schema, Config, Schedule, Match } from "effect"
    import { HttpClient, HttpClientResponse } from "@effect/platform"
    import { it, expect } from "@effect/vitest"

## Quick reference — Effect primitives

    Effect.succeed(value)            wrap a pure value
    Effect.fail(error)               fail with typed error
    Effect.sync(() => sideEffect())  wrap sync side effect
    Effect.promise(() => fetch(...)) wrap a Promise
    Effect.logInfo("msg")            structured logging
    Effect.logError("msg", cause)
    Effect.die(new Error("bug"))     defect — unrecoverable
    Effect.orDie                     promote typed error to defect
    Effect.runPromise(effect)        run at entry point (Node/Bun)
    Effect.runSync(effect)           run synchronously (no async ops)
`
