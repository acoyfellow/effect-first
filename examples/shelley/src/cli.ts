import { Effect } from "effect"
import { greetOrFallback } from "./greeter.js"

const name = process.argv[2] ?? "World"

Effect.runPromise(greetOrFallback(name)).then((message) => {
  console.log(message)
})
