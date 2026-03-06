import { Data } from "effect"

export class InvalidNameError extends Data.TaggedError("InvalidNameError")<{
  readonly reason: string
}> {}
