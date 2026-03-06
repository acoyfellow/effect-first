import { Effect } from "effect"
import { describe, expect, it } from "vitest"
import { completeTodo, listOpenTodos } from "./todo-repo.js"

describe("codex todo repo", () => {
  it("lists open todos", async () => {
    await expect(Effect.runPromise(listOpenTodos)).resolves.toHaveLength(2)
  })

  it("completes a known todo", async () => {
    await expect(Effect.runPromise(completeTodo("todo-1"))).resolves.toMatchObject({
      id: "todo-1",
      completed: true,
    })
  })
})
