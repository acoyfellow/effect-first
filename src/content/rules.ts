export const RULES_TEXT = `# Effect-First TypeScript — Rules

## RULE 1 — Effect.fn for all named effectful functions
- Wrap every named effectful function (including nullary) with Effect.fn("name")(function* (...) { ... })
- Optional second arg transforms the whole effect (retry, timeout, etc.)
- Never use async functions for effectful code

## RULE 2 — Effect.gen for sequencing
- Use Effect.gen(function* () { ... }) to sequence effects
- yield* each Effect; return final value

## RULE 3 — Schema.TaggedError for all errors
- Every error: class MyError extends Schema.TaggedError<MyError>()("MyError", { ...fields })
- Recover with Effect.catchTag("Tag", handler) or Effect.catchAll
- E channel = domain failures callers handle (not found, validation, rate limit)
- Defects (Effect.die / Effect.orDie) = bugs/invariant violations, handled at boundary only

## RULE 4 — Context.Tag + Layer for all services
- class Svc extends Context.Tag("@scope/Svc")<Svc, { readonly method: (...) => Effect.Effect<A, E> }>() {}
- Tag IDs globally unique (@scope/Name)
- Service methods must have R = never; dependencies resolved via Layer, not method signatures
- Implement via static layer = Layer.effect(Tag, Effect.gen(function* () { ... }))
- Layer names: layer, testLayer, postgresLayer (camelCase + Layer suffix)
- Compose layers at entry point with Layer.provideMerge; provide once via Effect.provide(appLayer)
- Parameterized layer constructors: assign to module-level const before reuse (memoization by reference)

## RULE 5 — Schema for all data
- Schema.Class for records: class User extends Schema.Class<User>("User")({ ...fields }) {}
- Schema.TaggedClass for union variants, discriminate with Match.valueTags
- Brand all domain primitives: Schema.String.pipe(Schema.brand("UserId"))
- Type extraction: type UserId = typeof UserId.Type
- JSON: Schema.parseJson(MySchema) for encode/decode

## RULE 6 — Schema.Config + config service layers
- Schema.Config("ENV_VAR", MySchema) for validated/branded config
- Config.redacted("SECRET") for secrets (auto-hidden in logs)
- Group related config into a single Context.Tag service with layer + testLayer

## RULE 7 — Resilience via pipe
- Chain: Effect.timeout, Effect.retry(Schedule.exponential(...).pipe(Schedule.compose(Schedule.recurs(n)))), Effect.tap, Effect.withSpan
- Apply as .pipe() instrumentation on effects

## RULE 8 — @effect/vitest for testing
- it.effect("name", () => Effect.gen(function* () { ... }).pipe(Effect.provide(Svc.testLayer)))
- it.layer(Svc.testLayer)("suite", (it) => { it.effect(...) }) for shared expensive resources
- Test layers: Layer.sync(Tag, () => Tag.of({ ...in-memory impl }))

## RULE 9 — Service-driven development workflow
1. Sketch leaf service Tags (contracts, no impl)
2. Write orchestration (higher-level services yield* leaf tags — compiles immediately)
3. Implement leaf Layers
4. Wire at entry point (compose into appLayer, provide once)

## TypeScript Config (non-negotiable)
- target: ES2022, module: NodeNext, moduleDetection: force
- verbatimModuleSyntax: true, rewriteRelativeImportExtensions: true
- strict: true, exactOptionalPropertyTypes: true
- noUnusedLocals: true, noImplicitOverride: true
- declarationMap: true, sourceMap: true, skipLibCheck: true
`
