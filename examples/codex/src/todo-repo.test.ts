import { it } from "@effect/vitest"
import { Effect } from "effect"
import { expect } from "vitest"
import { TodoRepo } from "./todo-repo.js"
import type { TodoId } from "./schema.js"

it.effect("creates a todo", () =>
  Effect.gen(function* () {
    const repo = yield* TodoRepo
    const todo = yield* repo.create("Buy milk")
    expect(todo.title).toBe("Buy milk")
    expect(todo.completed).toBe(false)
    expect(todo.id).toBe("test-1")
  }).pipe(Effect.provide(TodoRepo.testLayer))
)

it.effect("finds a todo by id", () =>
  Effect.gen(function* () {
    const repo = yield* TodoRepo
    const created = yield* repo.create("Read book")
    const found = yield* repo.findById(created.id)
    expect(found.title).toBe("Read book")
  }).pipe(Effect.provide(TodoRepo.testLayer))
)

it.effect("returns TodoNotFoundError for missing id", () =>
  Effect.gen(function* () {
    const repo = yield* TodoRepo
    const result = yield* repo.findById("nonexistent" as TodoId).pipe(Effect.flip)
    expect(result._tag).toBe("TodoNotFoundError")
    expect(result.id).toBe("nonexistent")
  }).pipe(Effect.provide(TodoRepo.testLayer))
)

it.effect("completes a todo", () =>
  Effect.gen(function* () {
    const repo = yield* TodoRepo
    const created = yield* repo.create("Do laundry")
    expect(created.completed).toBe(false)
    const completed = yield* repo.complete(created.id)
    expect(completed.completed).toBe(true)
    expect(completed.title).toBe("Do laundry")
  }).pipe(Effect.provide(TodoRepo.testLayer))
)

it.effect("rejects duplicate titles", () =>
  Effect.gen(function* () {
    const repo = yield* TodoRepo
    yield* repo.create("Unique task")
    const result = yield* repo.create("Unique task").pipe(Effect.flip)
    expect(result._tag).toBe("DuplicateTodoError")
    expect(result.title).toBe("Unique task")
  }).pipe(Effect.provide(TodoRepo.testLayer))
)

it.effect("lists all todos", () =>
  Effect.gen(function* () {
    const repo = yield* TodoRepo
    yield* repo.create("Task A")
    yield* repo.create("Task B")
    const todos = yield* repo.list()
    expect(todos).toHaveLength(2)
    expect(todos.map((t) => t.title)).toStrictEqual(["Task A", "Task B"])
  }).pipe(Effect.provide(TodoRepo.testLayer))
)
