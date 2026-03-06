import { Effect, Layer, ServiceMap } from "effect"
import { TodoNotFoundError } from "./errors.js"
import { decodeTodo, type Todo } from "./schema.js"

const seedTodos = (): Array<Todo> => [
  decodeTodo({ id: "todo-1", title: "Read the local codex example", completed: false }),
  decodeTodo({ id: "todo-2", title: "Retire the website layer", completed: false }),
]

export class TodoRepo extends ServiceMap.Service<TodoRepo, {
  readonly listOpen: Effect.Effect<Array<Todo>>
  readonly complete: (id: string) => Effect.Effect<Todo, TodoNotFoundError>
}>()("TodoRepo") {}

// TODO: replace this stub with a correct implementation during a captured run.
export const TodoRepoLive = Layer.succeed(TodoRepo)({
  listOpen: Effect.sync(() => [] as Array<Todo>),
  complete: (id) => Effect.fail(new TodoNotFoundError({ id })),
})

const appLayer = TodoRepoLive

// TODO: keep the exported signatures exactly as-is.
export const listOpenTodos = Effect.gen(function* () {
  const repo = yield* TodoRepo
  return yield* repo.listOpen
}).pipe(Effect.provide(appLayer))

export const completeTodo = (id: string) =>
  Effect.gen(function* () {
    const repo = yield* TodoRepo
    return yield* repo.complete(id)
  }).pipe(Effect.provide(appLayer))
