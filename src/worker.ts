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
import { toHtml } from "./html.js"

const BYTES_PER_TOKEN = 3.3

const estimateTokens = (text: string) => {
  const bytes = new TextEncoder().encode(text).length
  return Math.max(1, Math.ceil(bytes / BYTES_PER_TOKEN))
}

const textResponse = (text: string, route = "/", status = 200) =>
  Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest
    const accept = request.headers["accept"] ?? ""
    const wantJson = accept.includes("application/json") && !accept.includes("text/html")
    const wantHtml = accept.includes("text/html")
    const tokens = estimateTokens(text)

    if (wantJson) {
      return yield* HttpServerResponse.json(
        {
          ok: true,
          route: new URL(request.url, "http://localhost").pathname,
          tokens,
          content: text,
        },
        {
          status,
          headers: {
            "Cache-Control": "public, max-age=3600",
            "X-Token-Count": String(tokens),
          },
        }
      )
    }

    const body = wantHtml ? toHtml(text, route) : text
    return HttpServerResponse.text(body, {
      status,
      contentType: wantHtml ? "text/html; charset=utf-8" : "text/plain; charset=utf-8",
      headers: {
        "Cache-Control": "public, max-age=3600",
        "X-Token-Count": String(tokens),
      },
    })
  })

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

const validateVersion = (request: HttpServerRequest.HttpServerRequest) => {
  const url = new URL(request.url, "http://localhost")
  const version = url.searchParams.get("version")
  if (!version) {
    return null
  }
  const normalized = version.trim()
  if (normalized === "latest" || normalized === "3") {
    return null
  }
  return normalized
}

const withVersionGuard = (text: string, route: string) =>
  Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest
    const invalid = validateVersion(request)
    if (invalid) {
      return yield* textResponse(
        `Unsupported version "${invalid}". Use ?version=latest or ?version=3.`,
        route,
        400
      )
    }
    return yield* textResponse(text, route)
  })

const router = HttpRouter.empty.pipe(
  HttpRouter.get("/", withVersionGuard(INDEX_TEXT, "/")),
  HttpRouter.get("/rules", withVersionGuard(RULES_TEXT, "/rules")),
  HttpRouter.get("/reference", withVersionGuard(REFERENCE_TEXT, "/reference")),
  HttpRouter.get("/examples", withVersionGuard(EXAMPLES_TEXT, "/examples")),
  HttpRouter.get("/anti-patterns", withVersionGuard(ANTI_PATTERNS_TEXT, "/anti-patterns")),
  HttpRouter.get("/http-server", withVersionGuard(HTTP_SERVER_TEXT, "/http-server")),
  HttpRouter.get("/http-client", withVersionGuard(HTTP_CLIENT_TEXT, "/http-client")),
  HttpRouter.get("/sql", withVersionGuard(SQL_TEXT, "/sql")),
  HttpRouter.get("/cli", withVersionGuard(CLI_TEXT, "/cli")),
  HttpRouter.get("/streams", withVersionGuard(STREAMS_TEXT, "/streams")),
  HttpRouter.get("/concurrency", withVersionGuard(CONCURRENCY_TEXT, "/concurrency")),
  HttpRouter.get("/resources", withVersionGuard(RESOURCES_TEXT, "/resources")),
  HttpRouter.get("/full", withVersionGuard(GUIDE_TEXT, "/full")),
  HttpRouter.get(
    "/bundle",
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest
      const invalid = validateVersion(request)
      if (invalid) {
        return yield* textResponse(
          `Unsupported version "${invalid}". Use ?version=latest or ?version=3.`,
          "/bundle",
          400
        )
      }
      const url = new URL(request.url, "http://localhost")
      const modules = (url.searchParams.get("modules") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
      const parts = modules.flatMap((module) => (module in MODULES ? [MODULES[module]] : []))
      if (parts.length === 0) {
        return yield* textResponse(
          "Missing or invalid ?modules=. Valid modules: " + Object.keys(MODULES).join(", "),
          "/bundle",
          400
        )
      }
      const body = parts.join("\n\n---\n\n")
      return yield* textResponse(body, "/bundle")
    })
  ),
  HttpRouter.get("/health", HttpServerResponse.json({ ok: true }))
)

const handler = HttpApp.toWebHandler(router)

export { router, handler }

export default {
  fetch: handler,
}
