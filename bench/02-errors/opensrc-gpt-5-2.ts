```ts
// main.ts
import { Effect, Schema } from "effect"
import { NodeRuntime } from "@effect/platform-node"

// --- Tagged error ------------------------------------------------------------

class TooShortError extends Schema.TaggedError<TooShortError>()(
  "TooShortError",
  {
    input: Schema.String,
    minLength: Schema.Number
  }
) {}

// --- Program logic -----------------------------------------------------------

const validateInput = Effect.fn("validateInput", (input: string) =>
  Effect.gen(function* () {
    const minLength = 3

    if (input.length < minLength) {
      return yield* Effect.fail(new TooShortError({ input, minLength }))
    }

    return input
  })
)

const program = Effect.fn("program", (input: string) =>
  Effect.gen(function* () {
    const value = yield* validateInput(input)

    yield* Effect.log(`Success: "${value}" is valid (length=${value.length}).`)
  }).pipe(
    Effect.catchTag("TooShortError", (e) =>
      Effect.logError(
        `Error: input "${e.input}" is too short. Minimum length is ${e.minLength}.`
      )
    )
  )
)

// --- Entry point ------------------------------------------------------------

const input = process.argv[2] ?? ""

NodeRuntime.runMain(program(input))
```
