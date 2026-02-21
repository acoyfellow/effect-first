import { it } from "@effect/vitest"
import { Effect } from "effect"
import { expect } from "vitest"
import { INDEX_TEXT } from "./content/index.js"
import { handler } from "./worker.js"

// Helper: GET a route and return the Response
const get = (path: string) =>
  Effect.promise(() => handler(new Request(`http://localhost${path}`)))

it.effect("GET / returns 200 with text/plain content-type", () =>
  get("/").pipe(
    Effect.flatMap((res) =>
      Effect.sync(() => {
        expect(res.status).toBe(200)
        expect(res.headers.get("content-type")).toMatch(/text\/plain/)
      })
    )
  )
)

it.effect("GET / responds with the index text", () =>
  get("/").pipe(
    Effect.flatMap((res) =>
      Effect.promise(() => res.text()).pipe(
        Effect.flatMap((body) =>
          Effect.sync(() => {
            expect(body).toBe(INDEX_TEXT)
            expect(body).toContain("effect-first.coey.dev")
          })
        )
      )
    )
  )
)

it.effect("GET / includes charset=utf-8 in content-type", () =>
  get("/").pipe(
    Effect.flatMap((res) =>
      Effect.sync(() => {
        expect(res.headers.get("content-type")).toMatch(/charset=utf-8/)
      })
    )
  )
)

it.effect("GET / includes Cache-Control header", () =>
  get("/").pipe(
    Effect.flatMap((res) =>
      Effect.sync(() => {
        expect(res.headers.get("cache-control")).toBe("public, max-age=3600")
      })
    )
  )
)

it.effect("GET /rules returns 200 and contains RULE 1", () =>
  get("/rules").pipe(
    Effect.flatMap((res) =>
      Effect.promise(() => res.text()).pipe(
        Effect.flatMap((body) =>
          Effect.sync(() => {
            expect(res.status).toBe(200)
            expect(body).toContain("RULE 1")
          })
        )
      )
    )
  )
)

it.effect("GET /reference returns 200 and contains Effect Primitives", () =>
  get("/reference").pipe(
    Effect.flatMap((res) =>
      Effect.promise(() => res.text()).pipe(
        Effect.flatMap((body) =>
          Effect.sync(() => {
            expect(res.status).toBe(200)
            expect(body).toContain("Effect Primitives")
          })
        )
      )
    )
  )
)

it.effect("GET /examples returns 200 and contains Effect.fn", () =>
  get("/examples").pipe(
    Effect.flatMap((res) =>
      Effect.promise(() => res.text()).pipe(
        Effect.flatMap((body) =>
          Effect.sync(() => {
            expect(res.status).toBe(200)
            expect(body).toContain("Effect.fn")
          })
        )
      )
    )
  )
)

it.effect("GET /anti-patterns returns 200 and contains WRONG: and RIGHT:", () =>
  get("/anti-patterns").pipe(
    Effect.flatMap((res) =>
      Effect.promise(() => res.text()).pipe(
        Effect.flatMap((body) =>
          Effect.sync(() => {
            expect(res.status).toBe(200)
            expect(body).toContain("WRONG:")
            expect(body).toContain("RIGHT:")
          })
        )
      )
    )
  )
)

it.effect("GET /full returns 200 and contains # Effect-First TypeScript", () =>
  get("/full").pipe(
    Effect.flatMap((res) =>
      Effect.promise(() => res.text()).pipe(
        Effect.flatMap((body) =>
          Effect.sync(() => {
            expect(res.status).toBe(200)
            expect(body).toContain("# Effect-First TypeScript")
          })
        )
      )
    )
  )
)

it.effect("GET /health returns JSON { ok: true }", () =>
  get("/health").pipe(
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


it.effect("GET /http-server returns 200 and contains HttpApi", () =>
  get("/http-server").pipe(
    Effect.flatMap((res) =>
      Effect.promise(() => res.text()).pipe(
        Effect.flatMap((body) =>
          Effect.sync(() => {
            expect(res.status).toBe(200)
            expect(body).toContain("HttpApi")
          })
        )
      )
    )
  )
)

it.effect("GET /http-client returns 200 and contains HttpClient", () =>
  get("/http-client").pipe(
    Effect.flatMap((res) =>
      Effect.promise(() => res.text()).pipe(
        Effect.flatMap((body) =>
          Effect.sync(() => {
            expect(res.status).toBe(200)
            expect(body).toContain("HttpClient")
          })
        )
      )
    )
  )
)

it.effect("GET /sql returns 200 and contains SqlClient", () =>
  get("/sql").pipe(
    Effect.flatMap((res) =>
      Effect.promise(() => res.text()).pipe(
        Effect.flatMap((body) =>
          Effect.sync(() => {
            expect(res.status).toBe(200)
            expect(body).toContain("SqlClient")
          })
        )
      )
    )
  )
)

it.effect("GET /cli returns 200 and contains Command", () =>
  get("/cli").pipe(
    Effect.flatMap((res) =>
      Effect.promise(() => res.text()).pipe(
        Effect.flatMap((body) =>
          Effect.sync(() => {
            expect(res.status).toBe(200)
            expect(body).toContain("Command")
          })
        )
      )
    )
  )
)

it.effect("GET /streams returns 200 and contains Stream", () =>
  get("/streams").pipe(
    Effect.flatMap((res) =>
      Effect.promise(() => res.text()).pipe(
        Effect.flatMap((body) =>
          Effect.sync(() => {
            expect(res.status).toBe(200)
            expect(body).toContain("Stream")
          })
        )
      )
    )
  )
)
