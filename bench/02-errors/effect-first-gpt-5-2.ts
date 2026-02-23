```ts
// main.ts
import { Effect, Schema } from "effect"
import { NodeRuntime } from "@effect/platform-node"

// --- errors ---

class InputTooShortError extends Schema.TaggedError<InputTooShortError>()(
  "InputTooShortError",
  {
    readonly input: Schema.String,
    readonly minLength: Schema.Number
  }
) {}

// --- effectful functions ---

const validateInput = Effect.fn("validateInput")(function* (input: string) {
  const minLength = 3

  if (input.length < minLength) {
    return yield* Effect.fail(new InputTooShortError({ input, minLength }))
  }

  return input
})

const program = Effect.fn("program")(function* () {
  const input = process.argv[2] ?? ""

  const valid = yield* validateInput(input)

  yield* Effect.logInfo(`Success: "${valid}" is valid (length=${valid.length}).`)
})

// --- entry point ---

NodeRuntime.runMain(
  program.pipe(
    Effect.catchTag("InputTooShortError", (e) =>
      Effect.logError(
        `Error: input must be at least ${e.minLength} characters, got ${e.input.length} ("${e.input}").`
      )
    )
  )
)
```
