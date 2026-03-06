import { Effect } from "effect"
import { describe, expect, it } from "vitest"
import { greet } from "./greeter.js"

describe("codex greeter", () => {
  it("greets through the service layer", async () => {
    await expect(Effect.runPromise(greet("Jordan"))).resolves.toContain("Jordan")
  })
})
