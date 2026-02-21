import { Schema } from "effect"

export const Name = Schema.String.pipe(
  Schema.minLength(2),
  Schema.brand("Name")
)
export type Name = typeof Name.Type

export class Greeting extends Schema.Class<Greeting>("Greeting")({
  message: Schema.String,
  recipient: Name,
  shout: Schema.Boolean,
}) {}

// ── Todo domain ──────────────────────────────────────────────

export const TodoId = Schema.String.pipe(Schema.brand("TodoId"))
export type TodoId = typeof TodoId.Type

export class Todo extends Schema.Class<Todo>("Todo")({
  id: TodoId,
  title: Schema.String.pipe(Schema.minLength(1)),
  completed: Schema.Boolean,
}) {}
