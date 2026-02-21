export const REFERENCE_TEXT = `# Effect-TS Quick Reference

## Imports
import { Effect, Layer, Context, Schema, Config, Schedule, Match, Redacted } from "effect"
import { HttpClient, HttpClientResponse } from "@effect/platform"
import { it, expect } from "@effect/vitest"

## Type Signatures
Effect<A, E, R>  A=success  E=typed-error  R=required-services
Schema.Class<T>("Tag")({ field: Schema.String })  — branded record
Schema.TaggedError<T>()("Tag", { field: Schema.X })  — typed error
Schema.TaggedClass<T>()("Tag", { field: Schema.X })  — tagged variant
Context.Tag("@scope/Name")<Tag, Interface>()  — service tag
Layer.effect(Tag, Effect.gen(...))  — service impl
Layer.sync(Tag, () => Tag.of({...}))  — sync/test impl
Layer.succeed(Tag, Tag.of({...}))  — constant impl

## Effect Primitives
Effect.succeed(value)             pure value
Effect.fail(error)                typed error (E channel)
Effect.sync(() => expr)           wrap sync side-effect
Effect.promise(() => fetch(...))  wrap Promise
Effect.die(defect)                unrecoverable defect
Effect.orDie                      promote E to defect
Effect.logInfo(msg)               structured log
Effect.logError(msg, cause)       error log
Effect.runPromise(effect)         run at entry (async)
Effect.runSync(effect)            run at entry (sync)

## Generators
Effect.gen(function* () { const x = yield* someEffect; return x })
Effect.fn("name")(function* (arg: T) { ... })  — named + traced
Effect.fn("name")(function* (...) { ... }, flow(Effect.retry(...), Effect.timeout(...)))  — with transform

## .pipe() Combinators
Effect.timeout("2 seconds")
Effect.retry(Schedule.exponential("100 millis").pipe(Schedule.compose(Schedule.recurs(3))))
Effect.tap((a) => Effect.logInfo(...))
Effect.withSpan("spanName")
Effect.annotateCurrentSpan("key", value)
Effect.catchTag("ErrorTag", (e) => fallback)
Effect.catchAll((e) => fallback)
Effect.provide(layer)
Effect.orDie

## Schema
const UserId = Schema.String.pipe(Schema.brand("UserId"))
type UserId = typeof UserId.Type
Schema.Config("ENV_VAR", MySchema)  — validated config
Config.redacted("SECRET")  — secrets (logs as <redacted>)
Schema.parseJson(MySchema)  — JSON codec
Schema.decodeUnknown(schema)(input)  — decode
Schema.encode(schema)(value)  — encode

## tsconfig compilerOptions (required)
target: ES2022, module: NodeNext, moduleDetection: force,
verbatimModuleSyntax: true, rewriteRelativeImportExtensions: true,
strict: true, exactOptionalPropertyTypes: true,
noUnusedLocals: true, noImplicitOverride: true,
declarationMap: true, sourceMap: true, skipLibCheck: true
`;
