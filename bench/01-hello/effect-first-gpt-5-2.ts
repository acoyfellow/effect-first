```ts
// main.ts
import { Effect } from "effect"
import { NodeRuntime } from "@effect/platform-node"

const greet = Effect.fn("greet")(function* () {
  yield* Effect.logInfo("Hello, Effect!")
})

const program = Effect.gen(function* () {
  yield* greet()
})

NodeRuntime.runMain(program)
```
