import { Effect, Layer, ServiceMap } from "effect"
import { TodoNotFoundError } from "./errors.js"
import { GreeterLive } from "./greeter.js"
import { decodeTodo } from "./schema.js"

type Todo = ReturnType<typeof decodeTodo>

const seedTodos = (): Array<Todo> => [
  decodeTodo({ id: "todo-1", title: "Read the local codex example", completed: false }),
  decodeTodo({ id: "todo-2", title: "Keep examples local-first", completed: false }),
]

export class TodoRepo extends ServiceMap.Service<TodoRepo, {
  readonly listOpen: Effect.Effect<Array<Todo>>
  readonly complete: (id: string) => Effect.Effect<Todo, TodoNotFoundError>
}>()("TodoRepo") {}

export const TodoRepoLive = Layer.succeed(TodoRepo)({
  listOpen: Effect.sync(() => seedTodos().filter((todo) => !todo.completed)),
  complete: (id) =>
    Effect.sync(() => seedTodos().find((todo) => todo.id === id)).pipe(
      Effect.flatMap((todo) =>
        todo
          ? Effect.succeed({ ...todo, completed: true })
          : Effect.fail(new TodoNotFoundError({ id }))
      )
    ),
})

const appLayer = Layer.mergeAll(GreeterLive, TodoRepoLive)

export const listOpenTodos = Effect.gen(function* () {
  const repo = yield* TodoRepo
  return yield* repo.listOpen
}).pipe(Effect.provide(appLayer))

export const completeTodo = (id: string) =>
  Effect.gen(function* () {
    const repo = yield* TodoRepo
    return yield* repo.complete(id)
  }).pipe(Effect.provide(appLayer))
