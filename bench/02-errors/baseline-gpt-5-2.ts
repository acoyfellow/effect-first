```ts
// main.ts
import { Effect, Console } from "effect"
import { NodeRuntime } from "@effect/platform-node"
import { Schema } from "@effect/schema"

// --- Tagged errors ---
class TooShortError extends Schema.TaggedError<TooShortError>()("TooShortError", {
  input: Schema.String,
  minLength: Schema.Number
}) {}

// --- Named functions (Effect.fn) ---
const validateInput = Effect.fn("validateInput")(function* (input: string) {
  if (input.length < 3) {
    return yield* Effect.fail(new TooShortError({ input, minLength: 3 }))
  }
  return input
})

const program = Effect.fn("program")(function* () {
  const input = process.argv[2] ?? ""

  const value = yield* validateInput(input)

  yield* Console.log(`Success: "${value}" is valid`)
})

// --- Sequencing + error handling (Effect.gen + catchTag) ---
const main = Effect.gen(function* () {
  yield* program.pipe(
    Effect.catchTag("TooShortError", (e) =>
      Console.error(
        `Error: input "${e.input}" is too short (min length: ${e.minLength})`
      )
    )
  )
})

// --- Entry point ---
NodeRuntime.runMain(main)
```
