import { Effect } from "effect"
import { greet } from "./greeter.js"
import { summarizeLogs } from "./stream-processor.js"

const program = Effect.all([
  greet("Jordan"),
  summarizeLogs([
    { level: "info", message: "kit loaded" },
    { level: "warn", message: "website is only the gateway" },
    { level: "error", message: "fallback path taken" },
  ]),
])

Effect.runPromise(program).then(([message, summary]) => {
  console.log(message)
  console.log(summary)
})
