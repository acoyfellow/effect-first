import { Context, Effect, Layer } from "effect"
import { DuplicateTodoError, TodoNotFoundError } from "./errors.js"
import { Todo, type TodoId } from "./schema.js"

export class TodoRepo extends Context.Tag("@example/TodoRepo")<
  TodoRepo,
  {
    readonly create: (title: string) => Effect.Effect<Todo, DuplicateTodoError>
    readonly findById: (id: TodoId) => Effect.Effect<Todo, TodoNotFoundError>
    readonly complete: (id: TodoId) => Effect.Effect<Todo, TodoNotFoundError>
    readonly list: () => Effect.Effect<ReadonlyArray<Todo>>
  }
>() {
  /** In-memory implementation backed by a Map. */
  static readonly layer = Layer.sync(TodoRepo, () => {
    const store = new Map<TodoId, Todo>()
    let counter = 0

    return TodoRepo.of({
      create: Effect.fn("TodoRepo.create")(function* (title: string) {
        for (const existing of store.values()) {
          if (existing.title === title) {
            return yield* new DuplicateTodoError({ title })
          }
        }
        const id = String(++counter) as TodoId
        const todo = new Todo({ id, title, completed: false })
        store.set(id, todo)
        yield* Effect.logInfo(`Created todo ${id}: ${title}`)
        return todo
      }),

      findById: Effect.fn("TodoRepo.findById")(function* (id: TodoId) {
        const todo = store.get(id)
        if (!todo) return yield* new TodoNotFoundError({ id })
        return todo
      }),

      complete: Effect.fn("TodoRepo.complete")(function* (id: TodoId) {
        const existing = store.get(id)
        if (!existing) return yield* new TodoNotFoundError({ id })
        const updated = new Todo({ ...existing, completed: true })
        store.set(id, updated)
        yield* Effect.logInfo(`Completed todo ${id}`)
        return updated
      }),

      list: Effect.fn("TodoRepo.list")(function* () {
        return Array.from(store.values())
      }),
    })
  })

  /** Deterministic test layer with a seeded store. */
  static readonly testLayer = Layer.sync(TodoRepo, () => {
    const store = new Map<TodoId, Todo>()
    let counter = 0

    return TodoRepo.of({
      create: Effect.fn("TodoRepo.create")(function* (title: string) {
        for (const existing of store.values()) {
          if (existing.title === title) {
            return yield* new DuplicateTodoError({ title })
          }
        }
        const id = `test-${++counter}` as TodoId
        const todo = new Todo({ id, title, completed: false })
        store.set(id, todo)
        return todo
      }),

      findById: Effect.fn("TodoRepo.findById")(function* (id: TodoId) {
        const todo = store.get(id)
        if (!todo) return yield* new TodoNotFoundError({ id })
        return todo
      }),

      complete: Effect.fn("TodoRepo.complete")(function* (id: TodoId) {
        const existing = store.get(id)
        if (!existing) return yield* new TodoNotFoundError({ id })
        const updated = new Todo({ ...existing, completed: true })
        store.set(id, updated)
        return updated
      }),

      list: Effect.fn("TodoRepo.list")(function* () {
        return Array.from(store.values())
      }),
    })
  })
}
