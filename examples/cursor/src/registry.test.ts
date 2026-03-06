import { Effect } from "effect"
import { describe, expect, it } from "vitest"
import { validateProfile } from "./validator.js"

describe("cursor registry", () => {
  it("decodes a valid profile", async () => {
    await expect(
      Effect.runPromise(validateProfile({ name: "Jordan", retries: 2 }))
    ).resolves.toEqual({
      name: "Jordan",
      retries: 2,
    })
  })
})
