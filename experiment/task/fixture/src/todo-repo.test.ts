import { Effect } from "effect"
import { describe, expect, it } from "vitest"
import { completeTodo, listOpenTodos } from "./todo-repo.js"

describe("todo-repo-local-only-001", () => {
  it("lists open todos", async () => {
    await expect(Effect.runPromise(listOpenTodos)).resolves.toEqual([
      expect.objectContaining({ id: "todo-1", completed: false }),
      expect.objectContaining({ id: "todo-2", completed: false }),
    ])
  })

  it("completes a known todo", async () => {
    await expect(Effect.runPromise(completeTodo("todo-1"))).resolves.toMatchObject({
      id: "todo-1",
      completed: true,
    })
  })

  it("fails with TodoNotFoundError for an unknown todo", async () => {
    await expect(
      Effect.runPromise(completeTodo("missing").pipe(Effect.flip))
    ).resolves.toMatchObject({
      _tag: "TodoNotFoundError",
      id: "missing",
    })
  })
})
