import { it } from "@effect/vitest"
import { Effect } from "effect"
import { expect } from "vitest"
import { Greeter } from "./greeter.js"

it.effect("greets a valid name", () =>
  Effect.gen(function* () {
    const greeter = yield* Greeter
    const result = yield* greeter.greet("Alice", false)
    expect(result.message).toBe("Test: Alice")
    expect(result.recipient).toBe("Alice")
    expect(result.shout).toBe(false)
  }).pipe(Effect.provide(Greeter.testLayer))
)

it.effect("greets with shout", () =>
  Effect.gen(function* () {
    const greeter = yield* Greeter
    const result = yield* greeter.greet("Alice", true)
    expect(result.message).toBe("TEST: ALICE")
    expect(result.shout).toBe(true)
  }).pipe(Effect.provide(Greeter.testLayer))
)

it.effect("rejects short names", () =>
  Effect.gen(function* () {
    const greeter = yield* Greeter
    const result = yield* greeter.greet("A", false).pipe(
      Effect.flip
    )
    expect(result._tag).toBe("NameTooShortError")
    expect(result.name).toBe("A")
    expect(result.minLength).toBe(2)
  }).pipe(Effect.provide(Greeter.testLayer))
)
