import { it } from "@effect/vitest"
import { Effect } from "effect"
import { expect } from "vitest"
import { Validator } from "./validator.js"

// ── Valid inputs ────────────────────────────────────────────

it.effect("validates a correct user", () =>
  Effect.gen(function* () {
    const validator = yield* Validator
    const json = JSON.stringify({ name: "Alice", email: "alice@example.com", age: 30 })
    const result = yield* validator.validate("user", json)
    expect(result.valid).toBe(true)
    expect(result.schemaName).toBe("user")
    expect(result.errors).toStrictEqual([])
  }).pipe(Effect.provide(Validator.testLayer))
)

it.effect("validates a correct product", () =>
  Effect.gen(function* () {
    const validator = yield* Validator
    const json = JSON.stringify({ sku: "AB-123", title: "Widget", price: 9.99, inStock: true })
    const result = yield* validator.validate("product", json)
    expect(result.valid).toBe(true)
    expect(result.schemaName).toBe("product")
  }).pipe(Effect.provide(Validator.testLayer))
)

it.effect("validates a correct address", () =>
  Effect.gen(function* () {
    const validator = yield* Validator
    const json = JSON.stringify({ street: "123 Main St", city: "Springfield", state: "IL", zip: "62701" })
    const result = yield* validator.validate("address", json)
    expect(result.valid).toBe(true)
  }).pipe(Effect.provide(Validator.testLayer))
)

// ── Schema errors ───────────────────────────────────────────

it.effect("rejects user with invalid email", () =>
  Effect.gen(function* () {
    const validator = yield* Validator
    const json = JSON.stringify({ name: "Alice", email: "not-an-email", age: 30 })
    const result = yield* validator.validate("user", json).pipe(Effect.flip)
    expect(result._tag).toBe("ValidationFailedError")
    if (result._tag === "ValidationFailedError") {
      expect(result.schemaName).toBe("user")
      expect(result.errors.length).toBeGreaterThan(0)
    }
  }).pipe(Effect.provide(Validator.testLayer))
)

it.effect("rejects user with negative age", () =>
  Effect.gen(function* () {
    const validator = yield* Validator
    const json = JSON.stringify({ name: "Bob", email: "bob@test.com", age: -5 })
    const result = yield* validator.validate("user", json).pipe(Effect.flip)
    expect(result._tag).toBe("ValidationFailedError")
    if (result._tag === "ValidationFailedError") {
      expect(result.errors.some((e: string) => e.includes("age") || e.includes("0"))).toBe(true)
    }
  }).pipe(Effect.provide(Validator.testLayer))
)

it.effect("rejects product with bad SKU format", () =>
  Effect.gen(function* () {
    const validator = yield* Validator
    const json = JSON.stringify({ sku: "bad", title: "Widget", price: 9.99, inStock: true })
    const result = yield* validator.validate("product", json).pipe(Effect.flip)
    expect(result._tag).toBe("ValidationFailedError")
  }).pipe(Effect.provide(Validator.testLayer))
)

it.effect("rejects product with zero price", () =>
  Effect.gen(function* () {
    const validator = yield* Validator
    const json = JSON.stringify({ sku: "AB-123", title: "Widget", price: 0, inStock: true })
    const result = yield* validator.validate("product", json).pipe(Effect.flip)
    expect(result._tag).toBe("ValidationFailedError")
  }).pipe(Effect.provide(Validator.testLayer))
)

it.effect("rejects address with invalid zip", () =>
  Effect.gen(function* () {
    const validator = yield* Validator
    const json = JSON.stringify({ street: "123 Main", city: "Town", state: "IL", zip: "abc" })
    const result = yield* validator.validate("address", json).pipe(Effect.flip)
    expect(result._tag).toBe("ValidationFailedError")
  }).pipe(Effect.provide(Validator.testLayer))
)

it.effect("rejects address with 3-letter state", () =>
  Effect.gen(function* () {
    const validator = yield* Validator
    const json = JSON.stringify({ street: "123 Main", city: "Town", state: "ILL", zip: "62701" })
    const result = yield* validator.validate("address", json).pipe(Effect.flip)
    expect(result._tag).toBe("ValidationFailedError")
  }).pipe(Effect.provide(Validator.testLayer))
)

// ── JSON parse errors ───────────────────────────────────────

it.effect("returns JsonParseError for invalid JSON", () =>
  Effect.gen(function* () {
    const validator = yield* Validator
    const result = yield* validator.validate("user", "not json").pipe(Effect.flip)
    expect(result._tag).toBe("JsonParseError")
    if (result._tag === "JsonParseError") {
      expect(result.input).toBe("not json")
    }
  }).pipe(Effect.provide(Validator.testLayer))
)

// ── Unknown schema ──────────────────────────────────────────

it.effect("returns SchemaNotFoundError for unknown schema", () =>
  Effect.gen(function* () {
    const validator = yield* Validator
    const result = yield* validator.validate("unknown", "{}").pipe(Effect.flip)
    expect(result._tag).toBe("SchemaNotFoundError")
    if (result._tag === "SchemaNotFoundError") {
      expect(result.name).toBe("unknown")
    }
  }).pipe(Effect.provide(Validator.testLayer))
)

// ── Missing fields ──────────────────────────────────────────

it.effect("rejects user with missing required fields", () =>
  Effect.gen(function* () {
    const validator = yield* Validator
    const json = JSON.stringify({ name: "Alice" })
    const result = yield* validator.validate("user", json).pipe(Effect.flip)
    expect(result._tag).toBe("ValidationFailedError")
    if (result._tag === "ValidationFailedError") {
      expect(result.errors.length).toBeGreaterThanOrEqual(1)
    }
  }).pipe(Effect.provide(Validator.testLayer))
)
