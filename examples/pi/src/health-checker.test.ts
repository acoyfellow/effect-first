import { describe, expect, it } from "vitest"
import { makeRuntime, monitorProgram } from "./health-checker.js"

describe("pi health checker", () => {
  it("runs through a managed runtime", async () => {
    const runtime = makeRuntime()

    try {
      await expect(runtime.runPromise(monitorProgram)).resolves.toMatchObject({
        status: "ok",
      })
    } finally {
      await runtime.dispose()
    }
  })
})
