import { Effect } from "effect"
import { FileSystem } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"
import { rule, tallyScore, matchesAny } from "../lib/score.js"
import { ruleAbsent } from "../lib/rules.js"

const mainFile = "main.ts"
const testFile = "clock.test.ts"

const readMain = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  return yield* fs.readFileString(mainFile)
})

const readTest = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  return yield* fs.readFileString(testFile)
})

const judge = Effect.gen(function* () {
  const source = yield* readMain
  const testSource = yield* readTest
  const rules = [
    rule("uses Context.Tag", matchesAny(source, [/Context\.Tag\(/])),
    rule("uses Layer.succeed", matchesAny(source, [/Layer\.succeed\(/])),
    rule("uses Effect.gen", matchesAny(source, [/Effect\.gen\(/])),
    rule(
      "provides layer at entry",
      matchesAny(source, [/Effect\.provide\(/]) && matchesAny(source, [/NodeRuntime\.runMain/])
    ),
    rule("uses NodeRuntime.runMain", matchesAny(source, [/NodeRuntime\.runMain/])),
    rule("defines Clock tag", matchesAny(source, [/Context\.Tag\([^\n]*Clock/])),
    rule("tag ID is globally qualified", matchesAny(source, [/Context\.Tag\(["']@[\w-]+\//])),
    rule("defines testLayer", matchesAny(source, [/testLayer/])),
    rule("service-driven workflow", matchesAny(source, [/Context\.Tag\(/])),
    rule("testing uses it.effect", matchesAny(testSource, [/it\.effect/])),
    rule("test provides testLayer", matchesAny(testSource, [/testLayer/])),
    ruleAbsent("no async functions", source, [/\basync function\b/]),
    ruleAbsent("no try/catch", source, [/\btry\b/, /\bcatch\b/]),
    ruleAbsent("no throw new Error", source, [/throw new Error/]),
    ruleAbsent("no Promise constructors", source, [/Promise</, /new Promise/]),
    ruleAbsent("no .then chains", source, [/\.then\(/]),
  ]

  return tallyScore(rules)
})

export const main = judge.pipe(Effect.provide(NodeFileSystem.layer))
