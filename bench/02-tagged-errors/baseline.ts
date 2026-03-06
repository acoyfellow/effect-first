import { Data, Effect } from "effect"

class MissingTodo extends Data.TaggedError("MissingTodo")<{ id: string }> {}

const load = Effect.fail(new MissingTodo({ id: "todo-1" }))

export const recovered = load.pipe(
  Effect.catchTag("MissingTodo", () => Effect.succeed("missing"))
)
