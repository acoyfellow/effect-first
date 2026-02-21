import { Effect } from "effect"
import { FileSystem } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"
import { rule, tallyScore, matchesAny } from "../lib/score.js"

const mainFile = "main.ts"

const readMain = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  return yield* fs.readFileString(mainFile)
})

const judge = Effect.gen(function* () {
  const source = yield* readMain
  const rules = [
    rule("uses Effect.fn", matchesAny(source, [/Effect\.fn\(/])),
    rule("uses Effect.gen", matchesAny(source, [/Effect\.gen\(/])),
    rule("uses Schema.TaggedError", matchesAny(source, [/Schema\.TaggedError/])),
    rule("uses Schema.Class", matchesAny(source, [/Schema\.Class/])),
    rule("uses Context.Tag+Layer", matchesAny(source, [/Context\.Tag/, /Layer\./])),
    rule("provides layers at entry", matchesAny(source, [/Effect\.provide\(/, /NodeRuntime\.runMain/])),
    rule("uses NodeRuntime.runMain", matchesAny(source, [/NodeRuntime\.runMain/])),
  ]

  return tallyScore(rules)
})

export const main = judge.pipe(Effect.provide(NodeFileSystem.layer))
