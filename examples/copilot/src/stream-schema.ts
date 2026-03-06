import { Schema } from "effect"

export const LogEventSchema = Schema.Struct({
  level: Schema.String,
  message: Schema.String,
})

export const decodeLogEvent = Schema.decodeUnknownSync(LogEventSchema)

export type LogEvent = {
  readonly level: "info" | "warn" | "error"
  readonly message: string
}
