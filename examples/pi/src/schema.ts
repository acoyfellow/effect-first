import { Schema } from "effect"

export const HealthTargetSchema = Schema.Struct({
  url: Schema.String,
  timeoutMs: Schema.Number,
})

export const decodeHealthTarget = Schema.decodeUnknownSync(HealthTargetSchema)
