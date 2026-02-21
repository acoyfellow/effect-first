import { Schema } from "effect"

export class EndpointUnreachableError extends Schema.TaggedError<EndpointUnreachableError>()(
  "EndpointUnreachableError",
  { url: Schema.String, reason: Schema.String }
) {}

export class HealthDegradedError extends Schema.TaggedError<HealthDegradedError>()(
  "HealthDegradedError",
  { url: Schema.String, successRate: Schema.Number, threshold: Schema.Number }
) {}
