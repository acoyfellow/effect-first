import { Effect, Layer, ServiceMap } from "effect"

class Greeter extends ServiceMap.Service<Greeter, { readonly greet: Effect.Effect<string> }>()("Greeter") {}
class TodoRepo extends ServiceMap.Service<TodoRepo, { readonly list: Effect.Effect<string[]> }>()("TodoRepo") {}

const appLayer = Layer.mergeAll(
  Layer.succeed(Greeter)({ greet: Effect.succeed("hi") }),
  Layer.succeed(TodoRepo)({ list: Effect.succeed(["todo"]) })
)

export const program = Effect.gen(function* () {
  const greeter = yield* Greeter
  const repo = yield* TodoRepo
  return [yield* greeter.greet, yield* repo.list]
}).pipe(Effect.provide(appLayer))
