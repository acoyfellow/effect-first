import { Context, Effect, Layer, Schema } from "effect"
import { ArrayFormatter, type ParseError } from "effect/ParseResult"
import { JsonParseError, ValidationFailedError } from "./errors.js"
import type { SchemaNotFoundError } from "./errors.js"
import { SchemaRegistry } from "./registry.js"
import { ValidationResult, type SchemaName } from "./schema.js"

// ── Validator service ─────────────────────────────────────

export class Validator extends Context.Tag("@example/Validator")<
  Validator,
  {
    readonly validate: (
      schemaName: string,
      jsonInput: string
    ) => Effect.Effect<
      ValidationResult,
      SchemaNotFoundError | JsonParseError | ValidationFailedError
    >
  }
>() {
  static readonly layer = Layer.effect(
    Validator,
    Effect.gen(function* () {
      const registry = yield* SchemaRegistry

      const validate = Effect.fn("Validator.validate")(
        function* (schemaName: string, jsonInput: string) {
          // 1. Look up the schema
          const schema = yield* registry.get(schemaName)

          // 2. Parse JSON
          let parsed: unknown
          try {
            parsed = JSON.parse(jsonInput)
          } catch (e) {
            return yield* new JsonParseError({
              input: jsonInput,
              reason: e instanceof Error ? e.message : "Invalid JSON",
            })
          }

          // 3. Decode through Effect Schema
          const result = yield* Schema.decodeUnknown(schema)(parsed).pipe(
            Effect.map(() =>
              new ValidationResult({
                valid: true,
                schemaName: schemaName as SchemaName,
                input: jsonInput,
                errors: [],
              })
            ),
            Effect.catchTag("ParseError", (parseError: ParseError) =>
              Effect.gen(function* () {
                const issues = ArrayFormatter.formatErrorSync(parseError)
                const messages = issues.map(
                  (i) => `${i.path.join(".")}${i.path.length > 0 ? ": " : ""}${i.message}`
                )
                return yield* new ValidationFailedError({
                  schemaName,
                  errors: messages,
                })
              })
            )
          )

          yield* Effect.logInfo(
            `Validated ${schemaName}: ${result.valid ? "OK" : "FAIL"}`
          )
          return result
        }
      )

      return Validator.of({ validate })
    })
  )

  static readonly testLayer = Validator.layer.pipe(
    Layer.provide(SchemaRegistry.testLayer)
  )
}
