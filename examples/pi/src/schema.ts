import { Schema } from "effect"

// ── Branded primitives ──────────────────────────────────────

export const EndpointUrl = Schema.String.pipe(
  Schema.minLength(1),
  Schema.brand("EndpointUrl")
)
export type EndpointUrl = typeof EndpointUrl.Type

export const Milliseconds = Schema.Number.pipe(
  Schema.nonNegative(),
  Schema.brand("Milliseconds")
)
export type Milliseconds = typeof Milliseconds.Type

export const Percentage = Schema.Number.pipe(
  Schema.greaterThanOrEqualTo(0),
  Schema.lessThanOrEqualTo(100),
  Schema.brand("Percentage")
)
export type Percentage = typeof Percentage.Type

// ── Data classes ────────────────────────────────────────────

export class HealthResult extends Schema.Class<HealthResult>("HealthResult")({
  url: EndpointUrl,
  healthy: Schema.Boolean,
  latencyMs: Milliseconds,
  checkedAt: Schema.String,
}) {}

export class HealthReport extends Schema.Class<HealthReport>("HealthReport")({
  url: EndpointUrl,
  totalChecks: Schema.Number,
  successCount: Schema.Number,
  avgLatencyMs: Milliseconds,
  successRate: Percentage,
}) {}
