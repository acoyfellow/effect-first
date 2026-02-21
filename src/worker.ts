import { HttpApp, HttpRouter, HttpServerResponse } from "@effect/platform"
import { Effect } from "effect"
import { GUIDE_TEXT } from "./content.js"

const router = HttpRouter.empty.pipe(
  HttpRouter.get(
    "/",
    Effect.succeed(
      HttpServerResponse.text(GUIDE_TEXT, {
        contentType: "text/plain; charset=utf-8",
        headers: { "Cache-Control": "public, max-age=3600" },
      })
    )
  ),
  HttpRouter.get(
    "/health",
    HttpServerResponse.json({ ok: true })
  )
)

const handler = HttpApp.toWebHandler(router)

export { router, handler }

export default {
  fetch: handler,
}
