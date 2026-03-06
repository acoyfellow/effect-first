import { Effect } from "effect"
import { describe, expect, it } from "vitest"
import { summarizeLogs } from "./stream-processor.js"

describe("copilot stream processor", () => {
  it("aggregates known levels", async () => {
    await expect(
      Effect.runPromise(
        summarizeLogs([
          { level: "info", message: "one" },
          { level: "warn", message: "two" },
          { level: "error", message: "three" },
          { level: "info", message: "four" },
        ])
      )
    ).resolves.toEqual({
      info: 2,
      warn: 1,
      error: 1,
    })
  })

  it("fails on unsupported levels", async () => {
    await expect(
      Effect.runPromise(summarizeLogs([{ level: "debug", message: "nope" }]))
    ).rejects.toMatchObject({
      _tag: "InvalidLogEventError",
    })
  })
})
