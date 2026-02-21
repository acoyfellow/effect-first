import { Schema } from "effect"

export class ParseError extends Schema.TaggedError<ParseError>()(
  "ParseError",
  { line: Schema.String, reason: Schema.String }
) {}

export class ThresholdBreachedError extends Schema.TaggedError<ThresholdBreachedError>()(
  "ThresholdBreachedError",
  { level: Schema.String, count: Schema.Number, threshold: Schema.Number }
) {}
