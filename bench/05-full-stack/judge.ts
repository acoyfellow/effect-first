import { Effect } from "effect"
import { FileSystem } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"
import { rule, tallyScore, matchesAny } from "../lib/score.js"
import { ruleAbsent } from "../lib/rules.js"

const mainFile = "main.ts"
const testFile = "main.test.ts"

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
    rule("uses Effect.fn", matchesAny(source, [/Effect\.fn\(/])),
    rule("uses Effect.gen", matchesAny(source, [/Effect\.gen\(/])),
    rule("uses Schema.TaggedError", matchesAny(source, [/Schema\.TaggedError/])),
    rule("uses Schema.Class", matchesAny(source, [/Schema\.Class/])),
    rule("uses Context.Tag", matchesAny(source, [/Context\.Tag\(/])),
    rule("uses Layer", matchesAny(source, [/Layer\./])),
    rule(
      "provides layers at entry",
      matchesAny(source, [/Effect\.provide\(/]) && matchesAny(source, [/NodeRuntime\.runMain/])
    ),
    rule("uses NodeRuntime.runMain", matchesAny(source, [/NodeRuntime\.runMain/])),
    rule("uses Config", matchesAny(source, [/Config\./])),
    rule("uses resilience", matchesAny(source, [/Effect\.(timeout|retry|withSpan)\(/])),
    rule("testing uses it.effect", matchesAny(testSource, [/it\.effect/])),
    rule("service-driven workflow", matchesAny(source, [/Context\.Tag\(/])),
    ruleAbsent("no async functions", source, [/\basync function\b/]),
    ruleAbsent("no try/catch", source, [/\btry\b/, /\bcatch\b/]),
    ruleAbsent("no throw new Error", source, [/throw new Error/]),
    ruleAbsent("no Promise constructors", source, [/Promise</, /new Promise/]),
    ruleAbsent("no .then chains", source, [/\.then\(/]),
  ]

  return tallyScore(rules)
})

export const main = judge.pipe(Effect.provide(NodeFileSystem.layer))
