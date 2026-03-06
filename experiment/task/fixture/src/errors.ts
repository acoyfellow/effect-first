import { Data } from "effect"

export class TodoNotFoundError extends Data.TaggedError("TodoNotFoundError")<{
  readonly id: string
}> {}
