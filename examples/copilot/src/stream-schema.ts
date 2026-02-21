import { Schema } from "effect"

export const LogLevel = Schema.Literal("DEBUG", "INFO", "WARN", "ERROR")
export type LogLevel = typeof LogLevel.Type

export const Timestamp = Schema.String.pipe(
  Schema.pattern(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
  Schema.brand("Timestamp")
)
export type Timestamp = typeof Timestamp.Type

export const ServiceName = Schema.String.pipe(
  Schema.minLength(1),
  Schema.brand("ServiceName")
)
export type ServiceName = typeof ServiceName.Type

export class LogEntry extends Schema.Class<LogEntry>("LogEntry")({
  timestamp: Timestamp,
  level: LogLevel,
  service: ServiceName,
  message: Schema.String,
}) {}

export class LogSummary extends Schema.Class<LogSummary>("LogSummary")({
  totalLines: Schema.Number,
  debugCount: Schema.Number,
  infoCount: Schema.Number,
  warnCount: Schema.Number,
  errorCount: Schema.Number,
  services: Schema.Array(ServiceName),
}) {
  get errorRate(): number {
    return this.totalLines > 0 ? this.errorCount / this.totalLines : 0
  }
}
