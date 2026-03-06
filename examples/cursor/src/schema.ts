import { Schema } from "effect"

export const ProfileSchema = Schema.Struct({
  name: Schema.String,
  retries: Schema.Number,
})

export const decodeProfile = Schema.decodeUnknownSync(ProfileSchema)
