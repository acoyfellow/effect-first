import { Effect, Layer } from "effect"
import { NodeRuntime } from "@effect/platform-node"
import { SchemaRegistry } from "./registry.js"
import { Validator } from "./validator.js"

const args = process.argv.slice(2)
const command = args[0]

const validateCommand = Effect.gen(function* () {
  const schemaIdx = args.indexOf("--schema")
  const schemaName = schemaIdx >= 0 ? args[schemaIdx + 1] : undefined
  const jsonIdx = args.indexOf("--json")
  const jsonInput = jsonIdx >= 0 ? args[jsonIdx + 1] : undefined

  if (!schemaName || !jsonInput) {
    yield* Effect.logError("Usage: cli validate --schema <name> --json '<json>'")
    return
  }

  const validator = yield* Validator
  yield* validator.validate(schemaName, jsonInput).pipe(
    Effect.catchTag("SchemaNotFoundError", (e) =>
      Effect.gen(function* () {
        yield* Effect.logError(
          `Schema "${e.name}" not found. Available: ${e.available.join(", ")}`
        )
        return yield* Effect.die(e)
      })
    ),
    Effect.catchTag("JsonParseError", (e) =>
      Effect.gen(function* () {
        yield* Effect.logError(`Invalid JSON: ${e.reason}`)
        return yield* Effect.die(e)
      })
    ),
    Effect.catchTag("ValidationFailedError", (e) =>
      Effect.gen(function* () {
        yield* Effect.logError(
          `Validation failed for "${e.schemaName}":\n${e.errors.map((err) => `  • ${err}`).join("\n")}`
        )
        return yield* Effect.die(e)
      })
    )
  )

  yield* Effect.logInfo(`✓ Valid ${schemaName}`)
})

const listCommand = Effect.gen(function* () {
  const registry = yield* SchemaRegistry
  const schemas = yield* registry.list()
  yield* Effect.logInfo(`Available schemas: ${schemas.join(", ")}`)
})

const program = Effect.gen(function* () {
  if (command === "validate") {
    yield* validateCommand
  } else if (command === "list") {
    yield* listCommand
  } else {
    yield* Effect.logInfo("Usage: cli <validate|list> [options]")
    yield* Effect.logInfo("  validate --schema <name> --json '<json>'")
    yield* Effect.logInfo("  list")
  }
})

const appLayer = Validator.layer.pipe(
  Layer.provide(SchemaRegistry.layer)
)

const fullLayer = Layer.mergeAll(appLayer, SchemaRegistry.layer)

NodeRuntime.runMain(program.pipe(Effect.provide(fullLayer)))
