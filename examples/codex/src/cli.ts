import { Effect } from "effect"
import { greet } from "./greeter.js"
import { listOpenTodos } from "./todo-repo.js"

const program = Effect.all([greet("Jordan"), listOpenTodos]).pipe(
  Effect.map(([message, todos]) => `${message} (${todos.length} open todos)`)
)

Effect.runPromise(program).then((summary) => {
  console.log(summary)
})
