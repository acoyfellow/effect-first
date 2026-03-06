import { Effect } from "effect"
import { SchemaRegistry, SchemaRegistryLive } from "./registry.js"

export const validateProfile = (input: unknown) =>
  Effect.gen(function* () {
    const registry = yield* SchemaRegistry
    return yield* registry.decodeProfile(input)
  }).pipe(Effect.provide(SchemaRegistryLive))
