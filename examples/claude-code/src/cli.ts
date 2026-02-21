import { Effect } from "effect"
import { NodeRuntime } from "@effect/platform-node"
import { Greeter } from "./greeter.js"

const args = process.argv.slice(2)
const command = args[0]

const program = Effect.gen(function* () {
  if (command !== "greet") {
    yield* Effect.logInfo("Usage: cli greet --name <name> [--shout]")
    return
  }

  const nameIdx = args.indexOf("--name")
  const name = nameIdx >= 0 ? args[nameIdx + 1] : undefined
  const shout = args.includes("--shout")

  if (!name) {
    yield* Effect.logError("Missing --name argument")
    return
  }

  const greeter = yield* Greeter
  const greeting = yield* greeter.greet(name, shout).pipe(
    Effect.catchTag("NameTooShortError", (e) =>
      Effect.gen(function* () {
        yield* Effect.logError(`Name "${e.name}" too short (min ${e.minLength} chars)`)
        return yield* Effect.die(e)
      })
    )
  )

  yield* Effect.logInfo(greeting.message)
})

const appLayer = Greeter.layer

NodeRuntime.runMain(program.pipe(Effect.provide(appLayer)))
