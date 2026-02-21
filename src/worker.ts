import { HttpApp, HttpRouter, HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { Effect } from "effect"
import { INDEX_TEXT } from "./content/index.js"
import { RULES_TEXT } from "./content/rules.js"
import { REFERENCE_TEXT } from "./content/reference.js"
import { EXAMPLES_TEXT } from "./content/examples.js"
import { ANTI_PATTERNS_TEXT } from "./content/anti-patterns.js"
import { HTTP_SERVER_TEXT } from "./content/http-server.js"
import { HTTP_CLIENT_TEXT } from "./content/http-client.js"
import { SQL_TEXT } from "./content/sql.js"
import { CLI_TEXT } from "./content/cli.js"
import { STREAMS_TEXT } from "./content/streams.js"
import { CONCURRENCY_TEXT } from "./content/concurrency.js"
import { RESOURCES_TEXT } from "./content/resources.js"
import { GUIDE_TEXT } from "./content.js"

const BYTES_PER_TOKEN = 3.3

const estimateTokens = (text: string) => {
  const bytes = new TextEncoder().encode(text).length
  return Math.max(1, Math.ceil(bytes / BYTES_PER_TOKEN))
}

const textResponse = (text: string, status = 200) =>
  Effect.succeed(
    HttpServerResponse.text(text, {
      status,
      contentType: "text/plain; charset=utf-8",
      headers: {
        "Cache-Control": "public, max-age=3600",
        "X-Token-Count": String(estimateTokens(text)),
      },
    })
  )

const MODULES: Record<string, string> = {
  rules: RULES_TEXT,
  reference: REFERENCE_TEXT,
  examples: EXAMPLES_TEXT,
  "anti-patterns": ANTI_PATTERNS_TEXT,
  "http-server": HTTP_SERVER_TEXT,
  "http-client": HTTP_CLIENT_TEXT,
  sql: SQL_TEXT,
  cli: CLI_TEXT,
  streams: STREAMS_TEXT,
  concurrency: CONCURRENCY_TEXT,
  resources: RESOURCES_TEXT,
  full: GUIDE_TEXT,
}

const router = HttpRouter.empty.pipe(
  HttpRouter.get("/", textResponse(INDEX_TEXT)),
  HttpRouter.get("/rules", textResponse(RULES_TEXT)),
  HttpRouter.get("/reference", textResponse(REFERENCE_TEXT)),
  HttpRouter.get("/examples", textResponse(EXAMPLES_TEXT)),
  HttpRouter.get("/anti-patterns", textResponse(ANTI_PATTERNS_TEXT)),
  HttpRouter.get("/http-server", textResponse(HTTP_SERVER_TEXT)),
  HttpRouter.get("/http-client", textResponse(HTTP_CLIENT_TEXT)),
  HttpRouter.get("/sql", textResponse(SQL_TEXT)),
  HttpRouter.get("/cli", textResponse(CLI_TEXT)),
  HttpRouter.get("/streams", textResponse(STREAMS_TEXT)),
  HttpRouter.get("/concurrency", textResponse(CONCURRENCY_TEXT)),
  HttpRouter.get("/resources", textResponse(RESOURCES_TEXT)),
  HttpRouter.get("/full", textResponse(GUIDE_TEXT)),
  HttpRouter.get(
    "/bundle",
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest
      const url = new URL(request.url, "http://localhost")
      const modules = (url.searchParams.get("modules") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
      const parts = modules.flatMap((module) => (module in MODULES ? [MODULES[module]] : []))
      if (parts.length === 0) {
        return yield* textResponse(
          "Missing or invalid ?modules=. Valid modules: " + Object.keys(MODULES).join(", "),
          400
        )
      }
      const body = parts.join("\n\n---\n\n")
      return yield* textResponse(body)
    })
  ),
  HttpRouter.get("/health", HttpServerResponse.json({ ok: true }))
)

const handler = HttpApp.toWebHandler(router)

export { router, handler }

export default {
  fetch: handler,
}
