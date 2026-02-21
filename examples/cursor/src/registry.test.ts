import { it } from "@effect/vitest"
import { Effect } from "effect"
import { expect } from "vitest"
import { SchemaRegistry } from "./registry.js"

it.effect("lists all built-in schemas", () =>
  Effect.gen(function* () {
    const registry = yield* SchemaRegistry
    const names = yield* registry.list()
    expect(names).toStrictEqual(["user", "product", "address"])
  }).pipe(Effect.provide(SchemaRegistry.testLayer))
)

it.effect("resolves a known schema", () =>
  Effect.gen(function* () {
    const registry = yield* SchemaRegistry
    const schema = yield* registry.get("user")
    expect(schema).toBeDefined()
  }).pipe(Effect.provide(SchemaRegistry.testLayer))
)

it.effect("returns SchemaNotFoundError for unknown schema", () =>
  Effect.gen(function* () {
    const registry = yield* SchemaRegistry
    const result = yield* registry.get("nonexistent").pipe(Effect.flip)
    expect(result._tag).toBe("SchemaNotFoundError")
    expect(result.name).toBe("nonexistent")
    expect(result.available).toStrictEqual(["user", "product", "address"])
  }).pipe(Effect.provide(SchemaRegistry.testLayer))
)
