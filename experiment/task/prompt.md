# task prompt: todo-repo-local-only-001

Implement only `experiment/task/fixture/src/todo-repo.ts`.

Do not edit any other file.

Requirements:

- use `ServiceMap.Service`
- use `Layer.succeed`
- use `Effect.gen`
- use a tagged `TodoNotFoundError`
- keep the repository logic local to the service layer
- do not rely on hidden mutable global state outside the repository layer
- validate seeded input through `experiment/task/fixture/src/schema.ts` before returning data

Required behavior:

1. `listOpenTodos` returns only incomplete todos from the seeded in-memory list.
2. `completeTodo("todo-1")` returns the matching todo with `completed: true`.
3. `completeTodo("missing")` fails with `TodoNotFoundError`.

Your output should be the complete contents of `experiment/task/fixture/src/todo-repo.ts`.
