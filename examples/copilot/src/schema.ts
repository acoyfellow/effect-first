import { Schema } from "effect"

export const NameInput = Schema.Struct({
  name: Schema.String,
})

export const decodeNameInput = Schema.decodeUnknownSync(NameInput)
