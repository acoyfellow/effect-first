import { it } from "@effect/vitest"
import { Effect } from "effect"
import { expect } from "vitest"
import { LogProcessor } from "./stream-processor.js"

const SAMPLE_LINES = [
  "2024-01-15T10:30:00 INFO auth User logged in",
  "2024-01-15T10:30:01 DEBUG auth Session token refreshed",
  "2024-01-15T10:30:02 WARN billing Payment retry #2",
  "2024-01-15T10:30:03 ERROR billing Payment failed",
  "2024-01-15T10:30:04 INFO auth User logged out",
  "2024-01-15T10:30:05 ERROR api Timeout calling upstream",
]

it.effect("processes all lines with DEBUG min level", () =>
  Effect.gen(function* () {
    const processor = yield* LogProcessor
    const summary = yield* processor.process(SAMPLE_LINES, "DEBUG")
    expect(summary.totalLines).toBe(6)
    expect(summary.debugCount).toBe(1)
    expect(summary.infoCount).toBe(2)
    expect(summary.warnCount).toBe(1)
    expect(summary.errorCount).toBe(2)
    expect(summary.services).toContain("auth")
    expect(summary.services).toContain("billing")
    expect(summary.services).toContain("api")
  }).pipe(Effect.provide(LogProcessor.testLayer))
)

it.effect("filters entries below WARN level", () =>
  Effect.gen(function* () {
    const processor = yield* LogProcessor
    const summary = yield* processor.process(SAMPLE_LINES, "WARN")
    expect(summary.totalLines).toBe(3)
    expect(summary.debugCount).toBe(0)
    expect(summary.infoCount).toBe(0)
    expect(summary.warnCount).toBe(1)
    expect(summary.errorCount).toBe(2)
  }).pipe(Effect.provide(LogProcessor.testLayer))
)

it.effect("filters entries below ERROR level", () =>
  Effect.gen(function* () {
    const processor = yield* LogProcessor
    const summary = yield* processor.process(SAMPLE_LINES, "ERROR")
    expect(summary.totalLines).toBe(2)
    expect(summary.errorCount).toBe(2)
    expect(summary.services).toHaveLength(2)
  }).pipe(Effect.provide(LogProcessor.testLayer))
)

it.effect("computes error rate", () =>
  Effect.gen(function* () {
    const processor = yield* LogProcessor
    const summary = yield* processor.process(SAMPLE_LINES, "DEBUG")
    expect(summary.errorRate).toBeCloseTo(2 / 6, 5)
  }).pipe(Effect.provide(LogProcessor.testLayer))
)

it.effect("returns empty summary for no matching lines", () =>
  Effect.gen(function* () {
    const processor = yield* LogProcessor
    const infoOnly = [
      "2024-01-15T10:30:00 INFO auth User logged in",
    ]
    const summary = yield* processor.process(infoOnly, "ERROR")
    expect(summary.totalLines).toBe(0)
    expect(summary.errorRate).toBe(0)
    expect(summary.services).toHaveLength(0)
  }).pipe(Effect.provide(LogProcessor.testLayer))
)

it.effect("fails on unparseable lines", () =>
  Effect.gen(function* () {
    const processor = yield* LogProcessor
    const bad = ["not a valid log line"]
    const result = yield* processor.process(bad, "DEBUG").pipe(Effect.flip)
    expect(result._tag).toBe("ParseError")
  }).pipe(Effect.provide(LogProcessor.testLayer))
)

it.effect("filterByLevel utility works", () =>
  Effect.gen(function* () {
    const processor = yield* LogProcessor
    // First get parsed entries via process at DEBUG level
    // Then use filterByLevel directly
    const entries = [
      { timestamp: "2024-01-15T10:30:00" as any, level: "INFO" as const, service: "auth" as any, message: "test" },
      { timestamp: "2024-01-15T10:30:01" as any, level: "ERROR" as const, service: "api" as any, message: "fail" },
    ] as any
    const filtered = processor.filterByLevel(entries, "ERROR")
    expect(filtered).toHaveLength(1)
    expect(filtered[0].level).toBe("ERROR")
  }).pipe(Effect.provide(LogProcessor.testLayer))
)
