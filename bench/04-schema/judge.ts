import { Effect } from "effect"
import { NodeFileSystem } from "@effect/platform-node"
import { rule, tallyScore, matchesAny } from "../lib/score.js"

const mainFile = "main.ts"

const readMain = Effect.gen(function* () {
  const fs = yield* NodeFileSystem
  return yield* fs.readFileString(mainFile)
})

const judge = Effect.gen(function* () {
  const source = yield* readMain
  const rules = [
    rule("uses Schema.Class", matchesAny(source, [/Schema\.Class/])),
    rule("uses Schema.brand", matchesAny(source, [/Schema\.brand/])),
    rule("uses Effect.fn", matchesAny(source, [/Effect\.fn\(/])),
    rule("uses Effect.gen", matchesAny(source, [/Effect\.gen\(/])),
    rule("uses NodeRuntime.runMain", matchesAny(source, [/NodeRuntime\.runMain/])),
  ]

  return tallyScore(rules)
})

export const main = judge
