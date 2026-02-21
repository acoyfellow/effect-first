import { it } from "@effect/vitest"
import { Effect } from "effect"
import { expect } from "vitest"
import { GUIDE_TEXT } from "./content.js"
import { handler } from "./worker.js"

it.effect("GET / returns 200 with text/plain content-type", () =>
  Effect.promise(() => handler(new Request("http://localhost/"))).pipe(
    Effect.flatMap((res) =>
      Effect.gen(function* () {
        expect(res.status).toBe(200)
        expect(res.headers.get("content-type")).toMatch(/text\/plain/)
      })
    )
  )
)

it.effect("GET / responds with the full guide text", () =>
  Effect.promise(() => handler(new Request("http://localhost/"))).pipe(
    Effect.flatMap((res) =>
      Effect.promise(() => res.text()).pipe(
        Effect.flatMap((body) =>
          Effect.sync(() => {
            expect(body).toBe(GUIDE_TEXT)
            expect(body).toContain("# Effect-First TypeScript")
          })
        )
      )
    )
  )
)

it.effect("GET / includes charset=utf-8 in content-type", () =>
  Effect.promise(() => handler(new Request("http://localhost/"))).pipe(
    Effect.flatMap((res) =>
      Effect.sync(() => {
        expect(res.headers.get("content-type")).toMatch(/charset=utf-8/)
      })
    )
  )
)

it.effect("GET / includes Cache-Control header", () =>
  Effect.promise(() => handler(new Request("http://localhost/"))).pipe(
    Effect.flatMap((res) =>
      Effect.sync(() => {
        expect(res.headers.get("cache-control")).toBe("public, max-age=3600")
      })
    )
  )
)

it.effect("GET /health returns JSON { ok: true }", () =>
  Effect.promise(() => handler(new Request("http://localhost/health"))).pipe(
    Effect.flatMap((res) =>
      Effect.promise(() => res.json()).pipe(
        Effect.flatMap((body) =>
          Effect.sync(() => {
            expect(res.status).toBe(200)
            expect(body).toEqual({ ok: true })
          })
        )
      )
    )
  )
)
