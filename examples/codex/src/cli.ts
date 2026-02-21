import { Effect, Layer } from "effect"
import { NodeRuntime } from "@effect/platform-node"
import { Greeter } from "./greeter.js"
import { TodoRepo } from "./todo-repo.js"

const args = process.argv.slice(2)
const command = args[0]

const greetCommand = Effect.gen(function* () {
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

const todoCommand = Effect.gen(function* () {
  const sub = args[1]
  const repo = yield* TodoRepo

  if (sub === "add") {
    const titleIdx = args.indexOf("--title")
    const title = titleIdx >= 0 ? args[titleIdx + 1] : undefined
    if (!title) {
      yield* Effect.logError("Missing --title argument")
      return
    }
    const todo = yield* repo.create(title).pipe(
      Effect.catchTag("DuplicateTodoError", (e) =>
        Effect.gen(function* () {
          yield* Effect.logError(`Todo "${e.title}" already exists`)
          return yield* Effect.die(e)
        })
      )
    )
    yield* Effect.logInfo(`Created: [${todo.id}] ${todo.title}`)
  } else if (sub === "list") {
    const todos = yield* repo.list()
    if (todos.length === 0) {
      yield* Effect.logInfo("No todos yet.")
    } else {
      for (const t of todos) {
        const mark = t.completed ? "✓" : " "
        yield* Effect.logInfo(`[${mark}] ${t.id}: ${t.title}`)
      }
    }
  } else if (sub === "done") {
    const id = args[2]
    if (!id) {
      yield* Effect.logError("Missing todo id")
      return
    }
    const todo = yield* repo.complete(id as import("./schema.js").TodoId).pipe(
      Effect.catchTag("TodoNotFoundError", (e) =>
        Effect.gen(function* () {
          yield* Effect.logError(`Todo "${e.id}" not found`)
          return yield* Effect.die(e)
        })
      )
    )
    yield* Effect.logInfo(`Completed: [${todo.id}] ${todo.title}`)
  } else {
    yield* Effect.logInfo("Usage: cli todo <add|list|done> [options]")
  }
})

const program = Effect.gen(function* () {
  if (command === "greet") {
    yield* greetCommand
  } else if (command === "todo") {
    yield* todoCommand
  } else {
    yield* Effect.logInfo("Usage: cli <greet|todo> [options]")
  }
})

const appLayer = Layer.mergeAll(Greeter.layer, TodoRepo.layer)

NodeRuntime.runMain(program.pipe(Effect.provide(appLayer)))
