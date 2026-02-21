import { HttpApp, HttpRouter, HttpServerResponse } from "@effect/platform"
import { it } from "@effect/vitest"
import { Effect } from "effect"
import { expect } from "vitest"
import { GUIDE_TEXT } from "./content.js"

const router = HttpRouter.empty.pipe(
  HttpRouter.get(
    "/",
    Effect.succeed(HttpServerResponse.text(GUIDE_TEXT))
  )
)

const handler = HttpApp.toWebHandler(router)

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
