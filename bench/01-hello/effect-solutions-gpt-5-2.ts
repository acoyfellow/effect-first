```ts
// main.ts
import { Effect } from "effect"
import { NodeRuntime } from "@effect/platform-node"

const hello = Effect.fn("hello")(function* () {
  yield* Effect.log("Hello, Effect!")
})

const main = Effect.gen(function* () {
  yield* hello()
})

NodeRuntime.runMain(main)
```
