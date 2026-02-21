import { Schema } from "effect"

export class NameTooShortError extends Schema.TaggedError<NameTooShortError>()(
  "NameTooShortError",
  { name: Schema.String, minLength: Schema.Number }
) {}

export class GreetingFailedError extends Schema.TaggedError<GreetingFailedError>()(
  "GreetingFailedError",
  { cause: Schema.String }
) {}
