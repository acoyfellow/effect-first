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
