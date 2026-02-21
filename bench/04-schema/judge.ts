import { Effect } from "effect"
import { FileSystem } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"
import { rule, tallyScore, matchesAny } from "../lib/score.js"
import { ruleAbsent } from "../lib/rules.js"

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
    rule("uses Schema.Class", matchesAny(source, [/Schema\.Class/])),
    rule("uses Schema.brand", matchesAny(source, [/Schema\.brand/])),
    rule("uses Schema.encode", matchesAny(source, [/Schema\.encode/])),
    rule("uses Schema.decodeUnknown", matchesAny(source, [/Schema\.decodeUnknown/])),
    rule("uses NodeRuntime.runMain", matchesAny(source, [/NodeRuntime\.runMain/])),
    ruleAbsent("no async functions", source, [/\basync function\b/]),
    ruleAbsent("no try/catch", source, [/\btry\b/, /\bcatch\b/]),
    ruleAbsent("no throw new Error", source, [/throw new Error/]),
    ruleAbsent("no Promise constructors", source, [/Promise</, /new Promise/]),
    ruleAbsent("no .then chains", source, [/\.then\(/]),
  ]

  return tallyScore(rules)
})

export const main = judge.pipe(Effect.provide(NodeFileSystem.layer))
