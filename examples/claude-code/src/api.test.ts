import { Effect } from "effect"
import { describe, expect, it } from "vitest"
import { handleCreateBookmark, handleListBookmarks } from "./api-handlers.js"

describe("claude-code api handlers", () => {
  it("creates a bookmark from unknown input", async () => {
    await expect(
      Effect.runPromise(
        handleCreateBookmark({
          url: "https://effect.website",
          label: "Effect",
        })
      )
    ).resolves.toMatchObject({
      url: "https://effect.website",
      label: "Effect",
    })
  })

  it("lists existing bookmarks", async () => {
    await expect(Effect.runPromise(handleListBookmarks)).resolves.toHaveLength(1)
  })
})
