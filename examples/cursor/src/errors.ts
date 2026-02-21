import { Schema } from "effect"

export class SchemaNotFoundError extends Schema.TaggedError<SchemaNotFoundError>()(
  "SchemaNotFoundError",
  { name: Schema.String, available: Schema.Array(Schema.String) }
) {}

export class JsonParseError extends Schema.TaggedError<JsonParseError>()(
  "JsonParseError",
  { input: Schema.String, reason: Schema.String }
) {}

export class ValidationFailedError extends Schema.TaggedError<ValidationFailedError>()(
  "ValidationFailedError",
  {
    schemaName: Schema.String,
    errors: Schema.Array(Schema.String),
  }
) {}
