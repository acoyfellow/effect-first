import { Context, Effect, Layer, Sink, Stream } from "effect"
import { ParseError, ThresholdBreachedError } from "./stream-errors.js"
import type { LogEntry, LogLevel } from "./stream-schema.js"
import { LogSummary, ServiceName } from "./stream-schema.js"

// ---------------------------------------------------------------------------
// Parser service — turns raw log lines into LogEntry values
// ---------------------------------------------------------------------------

export class LogParser extends Context.Tag("@example/LogParser")<
  LogParser,
  {
    readonly parse: (line: string) => Effect.Effect<LogEntry, ParseError>
  }
>() {
  // Regex: 2024-01-15T10:30:00 ERROR auth Something went wrong
  static readonly layer = Layer.succeed(
    LogParser,
    LogParser.of({
      parse: Effect.fn("LogParser.parse")(function* (line: string) {
        const match = line.match(
          /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\s+(DEBUG|INFO|WARN|ERROR)\s+(\S+)\s+(.+)$/
        )
        if (!match) {
          return yield* new ParseError({ line, reason: "Does not match log format" })
        }
        const [, timestamp, level, service, message] = match
        // We trust the regex groups; cast through branded constructors
        return {
          timestamp: timestamp as LogEntry["timestamp"],
          level: level as LogLevel,
          service: service as LogEntry["service"],
          message,
        } as unknown as LogEntry
      }),
    })
  )

  static readonly testLayer = LogParser.layer
}

// ---------------------------------------------------------------------------
// Processor service — stream pipeline: parse → filter → aggregate
// ---------------------------------------------------------------------------

export class LogProcessor extends Context.Tag("@example/LogProcessor")<
  LogProcessor,
  {
    readonly process: (
      lines: ReadonlyArray<string>,
      minLevel: LogLevel
    ) => Effect.Effect<LogSummary, ParseError | ThresholdBreachedError>
    readonly filterByLevel: (
      entries: ReadonlyArray<LogEntry>,
      minLevel: LogLevel
    ) => ReadonlyArray<LogEntry>
  }
>() {
  static readonly layer = Layer.effect(
    LogProcessor,
    Effect.gen(function* () {
      const parser = yield* LogParser

      const LEVEL_ORDER: Record<LogLevel, number> = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
      }

      const filterByLevel = (
        entries: ReadonlyArray<LogEntry>,
        minLevel: LogLevel
      ): ReadonlyArray<LogEntry> => {
        const min = LEVEL_ORDER[minLevel]
        return entries.filter((e) => LEVEL_ORDER[e.level] >= min)
      }

      const process = Effect.fn("LogProcessor.process")(
        function* (lines: ReadonlyArray<string>, minLevel: LogLevel) {
          // 1. Build a stream from the raw lines
          const lineStream = Stream.fromIterable(lines)

          // 2. Parse each line into a LogEntry
          const entryStream = lineStream.pipe(
            Stream.mapEffect((line) => parser.parse(line))
          )

          // 3. Filter by minimum level
          const min = LEVEL_ORDER[minLevel]
          const filteredStream = entryStream.pipe(
            Stream.filter((entry) => LEVEL_ORDER[entry.level] >= min)
          )

          // 4. Aggregate into a summary via a Sink
          const summarySink = Sink.foldLeft(
            {
              totalLines: 0,
              debugCount: 0,
              infoCount: 0,
              warnCount: 0,
              errorCount: 0,
              services: new Set<string>(),
            },
            (
              acc: {
                totalLines: number
                debugCount: number
                infoCount: number
                warnCount: number
                errorCount: number
                services: Set<string>
              },
              entry: LogEntry
            ) => {
              acc.totalLines += 1
              acc.services.add(entry.service)
              switch (entry.level) {
                case "DEBUG":
                  acc.debugCount += 1
                  break
                case "INFO":
                  acc.infoCount += 1
                  break
                case "WARN":
                  acc.warnCount += 1
                  break
                case "ERROR":
                  acc.errorCount += 1
                  break
              }
              return acc
            }
          )

          const raw = yield* filteredStream.pipe(Stream.run(summarySink))

          yield* Effect.logInfo(
            `Processed ${raw.totalLines} entries from ${raw.services.size} services`
          )

          const ERROR_THRESHOLD = 100
          if (raw.errorCount > ERROR_THRESHOLD) {
            return yield* new ThresholdBreachedError({
              level: "ERROR",
              count: raw.errorCount,
              threshold: ERROR_THRESHOLD,
            })
          }

          return new LogSummary({
            totalLines: raw.totalLines,
            debugCount: raw.debugCount,
            infoCount: raw.infoCount,
            warnCount: raw.warnCount,
            errorCount: raw.errorCount,
            services: [...raw.services] as unknown as Array<ServiceName>,
          })
        }
      )

      return LogProcessor.of({ process, filterByLevel })
    })
  )

  static readonly testLayer = LogProcessor.layer.pipe(
    Layer.provide(LogParser.testLayer)
  )
}
