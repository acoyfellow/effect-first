import { HttpApiBuilder } from "@effect/platform"
import { NodeHttpServer } from "@effect/platform-node"
import { Effect, Layer } from "effect"
import { createServer } from "node:http"
import { ApiLive } from "./api-handlers.js"

const ServerLive = NodeHttpServer.layer(createServer, { port: 3001 })

const app = HttpApiBuilder.serve().pipe(
  Layer.provide(ServerLive),
  Layer.provide(ApiLive)
)

Layer.launch(app).pipe(Effect.runPromise)
