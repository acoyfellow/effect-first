import { Data } from "effect"

export class ValidationIssue extends Data.TaggedError("ValidationIssue")<{
  readonly message: string
}> {}
