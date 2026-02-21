import { describe, expect } from "vitest"
import { it } from "@effect/vitest"
import { Effect } from "effect"
import { Greeter } from "./main"

describe("Greeter", () => {
  it.effect("greets with app name", () =>
    Effect.gen(function* () {
      const greeter = yield* Greeter
      return yield* greeter.greet("Ada")
    }).pipe(
      Effect.provide(Greeter.layer),
      Effect.flatMap((greeting) =>
        Effect.sync(() => {
          expect(greeting.message).toContain("Hello")
        })
      )
    )
  )
})
