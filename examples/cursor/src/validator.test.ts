import { Effect } from "effect"
import { describe, expect, it } from "vitest"
import { validateProfile } from "./validator.js"

describe("cursor validator", () => {
  it("fails on invalid input", async () => {
    await expect(
      Effect.runPromise(validateProfile({ name: "Jordan", retries: "bad" }))
    ).rejects.toMatchObject({
      _tag: "ValidationIssue",
    })
  })
})
