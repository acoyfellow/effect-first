import { Effect } from "effect"
import { describe, expect, it } from "vitest"
import { greet } from "./greeter.js"

describe("copilot greeter", () => {
  it("greets through the service", async () => {
    await expect(Effect.runPromise(greet("Jordan"))).resolves.toContain("Jordan")
  })
})
