import { Data } from "effect"

export class HealthCheckError extends Data.TaggedError("HealthCheckError")<{
  readonly message: string
}> {}
