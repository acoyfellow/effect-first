import { Effect, Layer, ServiceMap } from "effect"
import { ValidationIssue } from "./errors.js"
import { decodeProfile } from "./schema.js"

export class SchemaRegistry extends ServiceMap.Service<SchemaRegistry, {
  readonly decodeProfile: (input: unknown) => Effect.Effect<ReturnType<typeof decodeProfile>, ValidationIssue>
}>()("SchemaRegistry") {}

export const SchemaRegistryLive = Layer.succeed(SchemaRegistry)({
  decodeProfile: (input) =>
    Effect.try({
      try: () => decodeProfile(input),
      catch: (error) =>
        new ValidationIssue({
          message:
            error instanceof Error ? error.message : "profile schema validation failed",
        }),
    }),
})
