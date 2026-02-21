export const ANTI_PATTERNS_TEXT = `WRONG: async function foo() { ... }
RIGHT: const foo = Effect.fn("foo")(function* () { ... })

WRONG: try { ... } catch (e) { ... }
RIGHT: Effect.catchTag / Effect.catchAll

WRONG: throw new Error("not found")
RIGHT: yield* new UserNotFoundError({ id }) (Schema.TaggedError)

WRONG: class MyError extends Error { ... }
RIGHT: class MyError extends Schema.TaggedError<MyError>()("MyError", { ... }) {}

WRONG: Promise<T> as service method return type
RIGHT: Effect.Effect<A, E> as service method return type

WRONG: Calling Postgres.layer(...) in multiple places
RIGHT: const dbLayer = Postgres.layer(...) — assign once, share reference

WRONG: Scattered Effect.provide(...) throughout codebase
RIGHT: Provide once at entry point via composed appLayer

WRONG: Effect.provide inside service method implementations
RIGHT: Layer composition handles all dependency wiring

WRONG: Config.string("PORT") for validated/branded values
RIGHT: Schema.Config("PORT", Port)

WRONG: console.log(apiKey) or Config.string("SECRET")
RIGHT: Config.redacted("SECRET") — logs as <redacted>

WRONG: Raw string for domain IDs (userId: string)
RIGHT: Schema.String.pipe(Schema.brand("UserId"))

WRONG: Plain generator function* for effectful code
RIGHT: Effect.fn("name")(function* (...) { ... }) for tracing + spans

WRONG: Effect.gen without yield* (using .then or await)
RIGHT: yield* inside Effect.gen(function* () { ... })

WRONG: interface + manual tag for services
RIGHT: class Db extends Context.Tag("@app/Db")<Db, { ... }>() {}

WRONG: Inline object literals for data models
RIGHT: Schema.Class / Schema.TaggedClass for runtime-validated models

WRONG: Union types via string literals or manual discriminants
RIGHT: Schema.Union(VariantA, VariantB) + Match.valueTags

WRONG: Mutable service interface properties
RIGHT: readonly on all service interface properties

WRONG: it("test", async () => { ... }) with manual runPromise
RIGHT: it.effect("test", () => Effect.gen(function* () { ... }))

WRONG: Writing full implementation before defining service contracts
RIGHT: Sketch Context.Tag contracts first, implement layers after
`
