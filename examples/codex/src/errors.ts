import { Schema } from "effect"

export class NameTooShortError extends Schema.TaggedError<NameTooShortError>()(
  "NameTooShortError",
  { name: Schema.String, minLength: Schema.Number }
) {}

export class GreetingFailedError extends Schema.TaggedError<GreetingFailedError>()(
  "GreetingFailedError",
  { cause: Schema.String }
) {}

// ── Todo errors ─────────────────────────────────────────────

export class TodoNotFoundError extends Schema.TaggedError<TodoNotFoundError>()(
  "TodoNotFoundError",
  { id: Schema.String }
) {}

export class DuplicateTodoError extends Schema.TaggedError<DuplicateTodoError>()(
  "DuplicateTodoError",
  { title: Schema.String }
) {}
