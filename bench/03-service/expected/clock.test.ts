import { describe, expect } from "vitest"
import { it } from "@effect/vitest"
import { Effect } from "effect"
import { Clock } from "./main"

describe("Clock", () => {
  it.effect("returns fixed timestamp", () =>
    Effect.gen(function* () {
      const clock = yield* Clock
      return yield* clock.now
    }).pipe(
      Effect.provide(Clock.testLayer),
      Effect.flatMap((result) =>
        Effect.sync(() => {
          expect(result).toBe(1700000000000)
        })
      )
    )
  )
})
