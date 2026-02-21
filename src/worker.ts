import { HttpApp, HttpRouter, HttpServerResponse } from "@effect/platform"
import { Effect } from "effect"
import { GUIDE_TEXT } from "./content.js"

const router = HttpRouter.empty.pipe(
  HttpRouter.get(
    "/",
    Effect.succeed(HttpServerResponse.text(GUIDE_TEXT))
  )
)

export default {
  fetch: HttpApp.toWebHandler(router),
}
