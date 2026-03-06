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

export const TodoRepoLive = Layer.succeed(TodoRepo)({
  listOpen: Effect.sync(() => seedTodos()),
  complete: (id) =>
    Effect.gen(function* () {
      const todo = seedTodos().find((candidate) => candidate.id === id)

      if (!todo) {
        return yield* Effect.fail(new TodoNotFoundError({ id }))
      }

      return todo
    }),
})

const appLayer = TodoRepoLive

export const listOpenTodos = Effect.gen(function* () {
  const repo = yield* TodoRepo
  return yield* repo.listOpen
}).pipe(Effect.provide(appLayer))

export const completeTodo = (id: string) =>
  Effect.gen(function* () {
    const repo = yield* TodoRepo
    return yield* repo.complete(id)
  }).pipe(Effect.provide(appLayer))
