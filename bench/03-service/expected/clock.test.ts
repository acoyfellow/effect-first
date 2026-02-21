import { describe, it, expect } from "vitest"
import { Effect } from "effect"
import { Clock } from "./main"

describe("Clock", () => {
  it("returns fixed timestamp", async () => {
    const program = Effect.gen(function* () {
      const clock = yield* Clock
      return yield* clock.now
    })

    const result = await Effect.runPromise(program.pipe(Effect.provide(Clock.testLayer)))
    expect(result).toBe(1700000000000)
  })
})
