import { Effect, Stream } from "effect"
import { InvalidLogEventError } from "./stream-errors.js"
import { decodeLogEvent, type LogEvent } from "./stream-schema.js"

const parseLogEvent = (input: unknown): Effect.Effect<LogEvent, InvalidLogEventError> =>
  Effect.try({
    try: () => decodeLogEvent(input),
    catch: (error) =>
      new InvalidLogEventError({
        message: error instanceof Error ? error.message : "log event is invalid",
      }),
  }).pipe(
    Effect.flatMap((event) =>
      event.level === "info" || event.level === "warn" || event.level === "error"
        ? Effect.succeed(event as LogEvent)
        : Effect.fail(
            new InvalidLogEventError({
              message: `unsupported log level: ${event.level}`,
            })
          )
    )
  )

export const summarizeLogs = (events: ReadonlyArray<unknown>) =>
  Effect.all(events.map(parseLogEvent)).pipe(
    Effect.flatMap((validEvents) =>
      Stream.fromIterable(validEvents).pipe(
        Stream.runFold(
          () => ({ info: 0, warn: 0, error: 0 }),
          (acc, event) => ({
            ...acc,
            [event.level]: acc[event.level] + 1,
          })
        )
      )
    )
  )
