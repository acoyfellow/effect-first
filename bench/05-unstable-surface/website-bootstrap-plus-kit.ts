import * as Http from "effect/unstable/http"
import { Effect, Layer, ServiceMap } from "effect"

class HttpAdapter extends ServiceMap.Service<HttpAdapter, {
  readonly request: Effect.Effect<typeof Http>
}>()("HttpAdapter") {}

const HttpAdapterLive = Layer.succeed(HttpAdapter)({
  request: Effect.succeed(Http),
})

export const program = Effect.gen(function* () {
  const adapter = yield* HttpAdapter
  return yield* adapter.request
}).pipe(Effect.provide(HttpAdapterLive))
