import { Effect } from "effect"
import { FileSystem } from "@effect/platform"
import { NodeFileSystem, NodeRuntime } from "@effect/platform-node"

const tasks = [
  "01-hello",
  "02-errors",
  "03-service",
  "04-schema",
  "05-full-stack",
] as const

const importJudge = (path: string) =>
  Effect.tryPromise({
    try: () => import(new URL(path, import.meta.url).href),
    catch: (error) => error as Error,
  })

const runTask = (task: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const root = `${process.cwd()}/bench/${task}`
    const judgeModule = `${root}/judge.ts`
    const expectedDir = `${root}/expected`

    const exists = yield* fs.exists(expectedDir)
    if (!exists) {
      yield* Effect.logError(`Missing expected dir for ${task}`)
      return { task, ok: false }
    }

    const module = yield* importJudge(judgeModule)
    const previous = process.cwd()
    yield* Effect.sync(() => process.chdir(expectedDir))
    const score = yield* module.main
    yield* Effect.sync(() => process.chdir(previous))

    return {
      task,
      ok: score.percentage === 100,
      score,
    }
  })

const program = Effect.gen(function* () {
  const results = [] as Array<unknown>
  for (const task of tasks) {
    const result = yield* runTask(task)
    results.push(result)
  }
  yield* Effect.logInfo(JSON.stringify(results, null, 2))
})

NodeRuntime.runMain(program.pipe(Effect.provide(NodeFileSystem.layer)))
