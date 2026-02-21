import { Context, Effect, Layer, Schema as S } from "effect"
import { SchemaNotFoundError } from "./errors.js"
import { User, Product, Address } from "./schema.js"

// ── SchemaRegistry service ─────────────────────────────────

export class SchemaRegistry extends Context.Tag("@example/SchemaRegistry")<
  SchemaRegistry,
  {
    readonly get: (name: string) => Effect.Effect<S.Schema<unknown>, SchemaNotFoundError>
    readonly list: () => Effect.Effect<ReadonlyArray<string>>
  }
>() {
  static readonly builtins: ReadonlyArray<[string, S.Schema<unknown>]> = [
    ["user", User as unknown as S.Schema<unknown>],
    ["product", Product as unknown as S.Schema<unknown>],
    ["address", Address as unknown as S.Schema<unknown>],
  ]

  static readonly layer = Layer.succeed(
    SchemaRegistry,
    SchemaRegistry.of({
      get: Effect.fn("SchemaRegistry.get")(function* (name: string) {
        const entry = SchemaRegistry.builtins.find(([n]) => n === name)
        if (!entry) {
          return yield* new SchemaNotFoundError({
            name,
            available: SchemaRegistry.builtins.map(([n]) => n),
          })
        }
        yield* Effect.logInfo(`Resolved schema: ${name}`)
        return entry[1]
      }),

      list: Effect.fn("SchemaRegistry.list")(function* () {
        return SchemaRegistry.builtins.map(([n]) => n)
      }),
    })
  )

  static readonly testLayer = Layer.succeed(
    SchemaRegistry,
    SchemaRegistry.of({
      get: Effect.fn("SchemaRegistry.get")(function* (name: string) {
        const entry = SchemaRegistry.builtins.find(([n]) => n === name)
        if (!entry) {
          return yield* new SchemaNotFoundError({
            name,
            available: SchemaRegistry.builtins.map(([n]) => n),
          })
        }
        return entry[1]
      }),

      list: Effect.fn("SchemaRegistry.list")(function* () {
        return SchemaRegistry.builtins.map(([n]) => n)
      }),
    })
  )
}
