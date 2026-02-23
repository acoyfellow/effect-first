```ts
// main.ts
import { Effect } from "effect"
import { NodeRuntime } from "@effect/platform-node"

const program = Effect.fn(function* () {
  yield* Effect.gen(function* () {
    yield* Effect.log("Hello, Effect!")
  })
})

NodeRuntime.runMain(program)
```
