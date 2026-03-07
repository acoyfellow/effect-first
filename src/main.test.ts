import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { CURRENT_HOMEPAGE, EXPERIMENT_RESULTS, LEGACY_ARCHIVE } from "./generated-site-content.js"
import { handler } from "./worker.js"

const get = (path: string, headers?: HeadersInit) =>
  handler(new Request(`http://localhost${path}`, headers ? { headers } : undefined))

describe("current site routes", () => {
  it("GET / returns the research homepage and links to the active evidence plus /old", async () => {
    const response = await get("/")
    const body = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toMatch(/text\/html/)
    expect(body).toContain("effect-first research")
    expect(body).toContain("definitive, citable evidence")
    expect(body).toContain("/old")
    expect(body).toContain("experiment/PROTOCOL.md")
    expect(body).toContain("experiment/results.json")
  })

  it("GET / embeds the MichaelArnaldi tweet for context", async () => {
    const response = await get("/")
    const body = await response.text()

    expect(body).toContain("twitter-tweet")
    expect(body).toContain("MichaelArnaldi/status/2027896616976281792")
    expect(body).toContain("platform.twitter.com/widgets.js")
  })

  it("GET /health returns JSON { ok: true }", async () => {
    const response = await get("/health")
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ ok: true })
  })

  it("retired public routes return 410 Gone", async () => {
    for (const path of ["/bootstrap.txt", "/adopt", "/evals", "/evals.json"]) {
      const response = await get(path)
      const body = await response.text()

      expect(response.status).toBe(410)
      expect(response.headers.get("content-type")).toMatch(/text\/plain/)
      expect(body).toContain("historical site now lives under /old")
    }
  })

  it("unknown routes return 404", async () => {
    const response = await get("/does-not-exist")
    const body = await response.text()

    expect(response.status).toBe(404)
    expect(body).toContain("active research homepage")
  })
})

describe("legacy archive routes", () => {
  it("GET /old serves the preserved legacy homepage", async () => {
    const response = await get("/old", { accept: "text/html" })
    const body = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toMatch(/text\/html/)
    expect(body).toContain("effect-first.coey.dev")
    expect(body).toContain('href="/old/rules"')
  })

  it("GET /old/rules serves preserved legacy content", async () => {
    const response = await get("/old/rules")
    const body = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toMatch(/text\/plain/)
    expect(body).toContain("RULE 1")
    expect(response.headers.get("X-Token-Count")).not.toBeNull()
  })

  it("GET /old/bundle preserves the old bundle behavior", async () => {
    const response = await get("/old/bundle?modules=rules,reference")
    const body = await response.text()

    expect(response.status).toBe(200)
    expect(body).toContain("RULE 1")
    expect(body).toContain("Effect Primitives")
  })

  it("GET /old with a bad version preserves the old 400 behavior", async () => {
    const response = await get("/old?version=4")
    const body = await response.text()

    expect(response.status).toBe(400)
    expect(body).toContain('Unsupported version "4"')
  })
})

describe("generated site content", () => {
  it("keeps the homepage copy in sync with site/homepage.md", () => {
    const expected = readFileSync(new URL("../site/homepage.md", import.meta.url), "utf8")
    expect(CURRENT_HOMEPAGE).toBe(expected)
  })

  it("keeps the experiment artifact in sync with experiment/results.json", () => {
    const expected = JSON.parse(
      readFileSync(new URL("../experiment/results.json", import.meta.url), "utf8")
    )
    expect(EXPERIMENT_RESULTS).toEqual(expected)
  })

  it("keeps the legacy archive pinned to commit 053b01d", () => {
    expect(LEGACY_ARCHIVE.commit).toBe("053b01d")
    expect(LEGACY_ARCHIVE.routeTextByPath["/"]).toContain("effect-first.coey.dev")
    expect(LEGACY_ARCHIVE.routeTextByPath["/rules"]).toContain("RULE 1")
    expect(LEGACY_ARCHIVE.routeTextByPath["/reference"]).toContain("Effect Primitives")
  })

  it("serves the completed restart experiment result", () => {
    expect(EXPERIMENT_RESULTS.status).toBe("complete")
    expect(EXPERIMENT_RESULTS.outcome).toBe("keep-investigating")
    expect(EXPERIMENT_RESULTS.recommendedAction).toBe(
      "keep-investigating-with-a-second-experiment"
    )
    expect(EXPERIMENT_RESULTS.arms).toEqual(["baseline", "local-only"])
    expect(EXPERIMENT_RESULTS.trials).toBe(3)
    expect(EXPERIMENT_RESULTS.trialResults.map((trial) => trial.winner)).toEqual([
      "local-only",
      "local-only",
      "local-only",
    ])
  })
})
