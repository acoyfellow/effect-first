import { Effect } from "effect"
import { describe, expect, it } from "vitest"
import { greet, greetOrFallback } from "./greeter.js"

describe("shelley greeter", () => {
  it("greets a valid name", async () => {
    await expect(Effect.runPromise(greet("Jordan"))).resolves.toBe("Hello, Jordan!")
  })

  it("recovers from an empty name with catchTag", async () => {
    await expect(Effect.runPromise(greetOrFallback("   "))).resolves.toContain(
      "Fallback greeting"
    )
  })
})
