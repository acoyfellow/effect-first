import { Effect } from "effect"
import { NodeRuntime } from "@effect/platform-node"

const program = Effect.gen(function* () {
  yield* Effect.logInfo("Hello, Effect!")
})

const main = Effect.fn("main")(function* () {
  return yield* program
})

NodeRuntime.runMain(main)
