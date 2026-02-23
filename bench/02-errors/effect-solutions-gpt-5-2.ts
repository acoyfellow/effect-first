```ts
// main.ts
import { Effect, Schema } from "effect"
import { NodeRuntime } from "@effect/platform-node"

// ----- Errors -----

class InputTooShortError extends Schema.TaggedError<InputTooShortError>()(
  "InputTooShortError",
  {
    readonly input: Schema.String,
    readonly minLength: Schema.Int
  }
) {}

// ----- Business logic -----

const validateInput = Effect.fn("validateInput")(function* (input: string) {
  const minLength = 3 as const

  if (input.length < minLength) {
    return yield* InputTooShortError.make({ input, minLength })
  }

  return input
})

const program = Effect.fn("program")(function* () {
  // You can change this to any string to see the behavior
  const input = "hi"

  const validated = yield* validateInput(input).pipe(
    Effect.catchTag("InputTooShortError", (e) =>
      Effect.logError(
        `Input too short: got "${e.input}" (length ${e.input.length}), expected at least ${e.minLength}`
      )
    )
  )

  // If validation succeeded, log success
  if (typeof validated === "string") {
    yield* Effect.logInfo(`Success: "${validated}" is valid`)
  }
})

// ----- Entry point -----

NodeRuntime.runMain(program)
```
