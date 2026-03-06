import { Data, Effect } from "effect"

class MissingTodo extends Data.TaggedError("MissingTodo")<{
  readonly id: string
}> {}

// _tag comes from Data.TaggedError and is the discriminant used by catchTag.
const load = Effect.fail(new MissingTodo({ id: "todo-1" }))

export const recovered = load.pipe(
  Effect.catchTag("MissingTodo", () => Effect.succeed("missing"))
)
