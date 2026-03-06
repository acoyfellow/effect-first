import { Data } from "effect"

export class InvalidLogEventError extends Data.TaggedError("InvalidLogEventError")<{
  readonly message: string
}> {}
