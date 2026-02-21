import { Effect } from "effect"
import { FileSystem } from "@effect/platform"
import { NodeFileSystem, NodeRuntime } from "@effect/platform-node"
import { config as loadEnv } from "dotenv"
import path from "node:path"

type TaskResult = {
  task: string
  baseline: ScoreResult
  treatment: ScoreResult
  delta: number
}

type ScoreResult = {
  percentage: number
  passedRules: number
  totalRules: number
  rules: Array<{ name: string; ok: boolean }>
}

const model = "gpt-4o-mini"
const tasks = [
  "01-hello",
  "02-errors",
  "03-service",
  "04-schema",
  "05-full-stack",
] as const

const openAiEndpoint = "https://api.openai.com/v1/chat/completions"

const loadOpenAiKey = () => {
  const envPath = path.resolve("/home/exedev/myfilepath-new/.env")
  loadEnv({ path: envPath })
  const key = process.env.OPENAI_API_KEY
  if (!key) {
    throw new Error(`OPENAI_API_KEY not found in ${envPath}`)
  }
  return key
}

const fetchText = (url: string) =>
  Effect.tryPromise({
    try: () => fetch(url).then((res) => res.text()),
    catch: (error) => error as Error,
  })

const readPrompt = (task: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const promptPath = `${process.cwd()}/bench/${task}/prompt.md`
    return yield* fs.readFileString(promptPath)
  })

const callOpenAi = (prompt: string, apiKey: string) =>
  Effect.tryPromise({
    try: async () => {
      const response = await fetch(openAiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.2,
        }),
      })

      if (!response.ok) {
        const body = await response.text()
        throw new Error(`OpenAI error (${response.status}): ${body}`)
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>
      }
      const content = payload.choices?.[0]?.message?.content
      if (!content) {
        throw new Error("OpenAI returned empty response")
      }
      return content.trim()
    },
    catch: (error) => error as Error,
  })

const buildTreatmentPrompt = (prompt: string) =>
  Effect.gen(function* () {
    const rules = yield* fetchText("https://effect-first.coey.dev/rules")
    const examples = yield* fetchText("https://effect-first.coey.dev/examples")
    return `EFFECT-FIRST RULES:\n${rules}\n\nEFFECT-FIRST EXAMPLES:\n${examples}\n\nTASK PROMPT:\n${prompt}`
  })

const writeOutput = (task: string, file: string, content: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const outputPath = `${process.cwd()}/bench/${task}/${file}`
    yield* fs.writeFileString(outputPath, content.trimEnd() + "\n")
  })

const withTempOutput = (task: string, output: string, run: Effect.Effect<ScoreResult>) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const expectedDir = `${process.cwd()}/bench/${task}/expected`
    const mainPath = `${expectedDir}/main.ts`
    const backupPath = `${expectedDir}/main.ts.bak`

    const mainExists = yield* fs.exists(mainPath)
    if (mainExists) {
      const current = yield* fs.readFileString(mainPath)
      yield* fs.writeFileString(backupPath, current)
    }

    yield* fs.writeFileString(mainPath, output.trimEnd() + "\n")
    const score = yield* run

    if (mainExists) {
      const backup = yield* fs.readFileString(backupPath)
      yield* fs.writeFileString(mainPath, backup)
      yield* fs.remove(backupPath)
    }

    return score
  })

const scoreOutput = (task: string, output: string) =>
  Effect.gen(function* () {
    const judgeModule = `./${task}/judge.ts`
    const previous = process.cwd()
    const expectedDir = `${process.cwd()}/bench/${task}/expected`

    const module = (yield* Effect.tryPromise({
      try: () => import(new URL(judgeModule, import.meta.url).href),
      catch: (error) => error as Error,
    })) as { main: Effect.Effect<ScoreResult> }

    const runScore = Effect.gen(function* () {
      yield* Effect.sync(() => process.chdir(expectedDir))
      const score = yield* module.main
      yield* Effect.sync(() => process.chdir(previous))
      return score
    })

    return yield* withTempOutput(task, output, runScore)
  })

const formatTable = (results: TaskResult[]) => {
  const header = "| Task | Baseline | Treatment | Delta |"
  const divider = "| --- | --- | --- | --- |"
  const rows = results
    .map((result) => {
      const baseline = `${result.baseline.percentage}% (${result.baseline.passedRules}/${result.baseline.totalRules})`
      const treatment = `${result.treatment.percentage}% (${result.treatment.passedRules}/${result.treatment.totalRules})`
      const delta = `${result.delta >= 0 ? "+" : ""}${result.delta}%`
      return `| ${result.task} | ${baseline} | ${treatment} | ${delta} |`
    })
    .join("\n")

  return [header, divider, rows].join("\n")
}

const runTask = (task: string, apiKey: string) =>
  Effect.gen(function* () {
    const prompt = yield* readPrompt(task)
    const treatmentPrompt = yield* buildTreatmentPrompt(prompt)

    const baselineOutput = yield* callOpenAi(prompt, apiKey)
    const treatmentOutput = yield* callOpenAi(treatmentPrompt, apiKey)

    yield* writeOutput(task, "baseline.ts", baselineOutput)
    yield* writeOutput(task, "treatment.ts", treatmentOutput)

    const baselineScore = yield* scoreOutput(task, baselineOutput)
    const treatmentScore = yield* scoreOutput(task, treatmentOutput)

    return {
      task,
      baseline: baselineScore,
      treatment: treatmentScore,
      delta: treatmentScore.percentage - baselineScore.percentage,
    }
  })

const program = Effect.gen(function* () {
  const apiKey = loadOpenAiKey()
  const results: TaskResult[] = []
  for (const task of tasks) {
    const result = yield* runTask(task, apiKey)
    results.push(result)
  }

  const table = formatTable(results)
  const summary = `# A/B Benchmark Results\n\nModel: ${model}\n\n${table}\n`
  const fs = yield* FileSystem.FileSystem
  yield* fs.writeFileString(`${process.cwd()}/bench/AB-RESULTS.md`, summary)
  yield* Effect.logInfo(`\n${summary}`)
})

NodeRuntime.runMain(program.pipe(Effect.provide(NodeFileSystem.layer)))
