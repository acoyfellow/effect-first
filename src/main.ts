import { HttpRouter, HttpServer, HttpServerResponse } from "@effect/platform"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { Effect, Layer } from "effect"
import { createServer } from "node:http"
import { GUIDE_TEXT } from "./content.js"

const router = HttpRouter.empty.pipe(
  HttpRouter.get(
    "/",
    Effect.succeed(
      HttpServerResponse.text(GUIDE_TEXT)
    )
  )
)

const app = router.pipe(HttpServer.serve())

const ServerLive = NodeHttpServer.layer(createServer, { port: 3000 })

const program = Effect.logInfo("Server started on http://localhost:3000").pipe(
  Effect.zipRight(Layer.launch(Layer.provide(app, ServerLive)))
)

NodeRuntime.runMain(program)
