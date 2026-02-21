import { HttpApp, HttpRouter, HttpServerResponse } from "@effect/platform"
import { Effect } from "effect"
import { INDEX_TEXT } from "./content/index.js"
import { RULES_TEXT } from "./content/rules.js"
import { REFERENCE_TEXT } from "./content/reference.js"
import { EXAMPLES_TEXT } from "./content/examples.js"
import { ANTI_PATTERNS_TEXT } from "./content/anti-patterns.js"
import { GUIDE_TEXT } from "./content.js"

const textResponse = (text: string) =>
  Effect.succeed(
    HttpServerResponse.text(text, {
      contentType: "text/plain; charset=utf-8",
      headers: { "Cache-Control": "public, max-age=3600" },
    })
  )

const router = HttpRouter.empty.pipe(
  HttpRouter.get("/", textResponse(INDEX_TEXT)),
  HttpRouter.get("/rules", textResponse(RULES_TEXT)),
  HttpRouter.get("/reference", textResponse(REFERENCE_TEXT)),
  HttpRouter.get("/examples", textResponse(EXAMPLES_TEXT)),
  HttpRouter.get("/anti-patterns", textResponse(ANTI_PATTERNS_TEXT)),
  HttpRouter.get("/full", textResponse(GUIDE_TEXT)),
  HttpRouter.get("/health", HttpServerResponse.json({ ok: true }))
)

const handler = HttpApp.toWebHandler(router)

export { router, handler }

export default {
  fetch: handler,
}
