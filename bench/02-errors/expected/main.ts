import { Effect, Schema } from "effect"
import { NodeRuntime } from "@effect/platform-node"

class TooShortError extends Schema.TaggedError<TooShortError>()("TooShortError", {
  value: Schema.String,
  minLength: Schema.Number,
}) {}

const validate = Effect.fn("validate")(function* (value: string) {
  if (value.length < 3) {
    return yield* new TooShortError({ value, minLength: 3 })
  }
  return value
})

const program = Effect.gen(function* () {
  const value = "hi"
  const result = yield* validate(value).pipe(
    Effect.catchTag("TooShortError", (error) =>
      Effect.gen(function* () {
        yield* Effect.logError(`Value "${error.value}" too short (min ${error.minLength})`)
        return ""
      })
    )
  )

  if (result) {
    yield* Effect.logInfo(`Value "${result}" is ok`)
  }
})

NodeRuntime.runMain(program)
