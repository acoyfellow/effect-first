import { Schema } from "effect"

export const TodoSchema = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  completed: Schema.Boolean,
})

export type Todo = Schema.Schema.Type<typeof TodoSchema>

export const decodeTodo = Schema.decodeUnknownSync(TodoSchema)
