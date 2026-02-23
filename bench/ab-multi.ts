import { Effect } from "effect"
import { FileSystem } from "@effect/platform"
import { NodeFileSystem, NodeRuntime } from "@effect/platform-node"
import { config as loadEnv } from "dotenv"
import path from "node:path"

type ScoreResult = {
  percentage: number
  passedRules: number
  totalRules: number
  rules: Array<{ rule: string; passed: boolean }>
}

type ConditionResult = {
  task: string
  scores: Record<string, ScoreResult>
}

const model = "gpt-5.2"
const tasks = [
  "01-hello",
  "02-errors",
  "03-service",
  "04-schema",
  "05-full-stack",
] as const

const conditions = ["baseline", "effect-first", "opensrc", "effect-solutions"] as const

const openAiEndpoint = "https://api.openai.com/v1/chat/completions"

const loadOpenAiKey = () => {
  loadEnv({ path: path.resolve("/home/exedev/myfilepath-new/.env") })
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error("OPENAI_API_KEY not found")
  return key
}

const fetchText = (url: string) =>
  Effect.tryPromise({
    try: () => fetch(url).then((r) => r.text()),
    catch: (e) => e as Error,
  })

const readFile = (p: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    return yield* fs.readFileString(p)
  })

const callModel = (prompt: string, apiKey: string) =>
  Effect.tryPromise({
    try: async () => {
      const res = await fetch(openAiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
        }),
      })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(`API error (${res.status}): ${t}`)
      }
      const p = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
      const c = p.choices?.[0]?.message?.content
      if (!c) throw new Error("Empty response")
      return c.trim()
    },
    catch: (e) => e as Error,
  })

// Build opensrc context: relevant type signatures from the actual Effect source
const buildOpensrcContext = () =>
  Effect.gen(function* () {
    const base = "/tmp/opensrc/repos/github.com/Effect-TS/effect/packages/effect/src"
    const fs = yield* FileSystem.FileSystem

    // Read key files and extract relevant sections (what an agent with opensrc access would grep for)
    const effectSrc = yield* fs.readFileString(`${base}/Effect.ts`)
    const contextSrc = yield* fs.readFileString(`${base}/Context.ts`)
    const layerSrc = yield* fs.readFileString(`${base}/Layer.ts`)
    const schemaSrc = yield* fs.readFileString(`${base}/Schema.ts`)

    // Extract export signatures — what an agent would actually look at
    const extractExports = (src: string, names: string[]) =>
      names.map((name) => {
        const re = new RegExp(`export (const|function|class|type|interface) ${name}[^\n]*([\\s\\S]{0,500})`, "m")
        const m = src.match(re)
        return m ? m[0].slice(0, 500) : `// ${name} not found`
      }).join("\n\n")

    const context = [
      "// === Effect source: Effect.ts (key exports) ===",
      extractExports(effectSrc, ["fn", "gen", "catchTag", "provide", "timeout", "retry"]),
      "",
      "// === Effect source: Context.ts ===",
      extractExports(contextSrc, ["Tag"]),
      "",
      "// === Effect source: Layer.ts (key exports) ===",
      extractExports(layerSrc, ["succeed", "effect", "provide", "mergeAll"]),
      "",
      "// === Effect source: Schema.ts (key exports) ===",
      extractExports(schemaSrc, ["TaggedError", "Class", "brand", "Config"]),
    ].join("\n")

    return context
  })

const buildEffectSolutionsContext = () =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    return yield* fs.readFileString("/tmp/effect-solutions-content.txt")
  })

const buildEffectFirstContext = () =>
  Effect.gen(function* () {
    const rules = yield* fetchText("https://effect-first.coey.dev/rules")
    const examples = yield* fetchText("https://effect-first.coey.dev/examples")
    return `EFFECT-FIRST RULES:\n${rules}\n\nEFFECT-FIRST EXAMPLES:\n${examples}`
  })

const withTempOutput = (task: string, output: string, run: Effect.Effect<ScoreResult>) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const dir = `${process.cwd()}/bench/${task}/expected`
    const mainPath = `${dir}/main.ts`
    const bakPath = `${dir}/main.ts.bak`
    const exists = yield* fs.exists(mainPath)
    if (exists) {
      yield* fs.writeFileString(bakPath, yield* fs.readFileString(mainPath))
    }
    yield* fs.writeFileString(mainPath, output.trimEnd() + "\n")
    const score = yield* run
    if (exists) {
      yield* fs.writeFileString(mainPath, yield* fs.readFileString(bakPath))
      yield* fs.remove(bakPath)
    }
    return score
  })

const scoreOutput = (task: string, output: string) =>
  Effect.gen(function* () {
    const mod = (yield* Effect.tryPromise({
      try: () => import(new URL(`./${task}/judge.ts`, import.meta.url).href),
      catch: (e) => e as Error,
    })) as { main: Effect.Effect<ScoreResult> }
    const prev = process.cwd()
    const dir = `${process.cwd()}/bench/${task}/expected`
    const run = Effect.gen(function* () {
      yield* Effect.sync(() => process.chdir(dir))
      const s = yield* mod.main
      yield* Effect.sync(() => process.chdir(prev))
      return s
    })
    return yield* withTempOutput(task, output, run)
  })

const program = Effect.gen(function* () {
  const apiKey = loadOpenAiKey()

  // Pre-build contexts
  yield* Effect.logInfo("Building contexts...")
  const effectFirstCtx = yield* buildEffectFirstContext()
  const opensrcCtx = yield* buildOpensrcContext()
  const effectSolutionsCtx = yield* buildEffectSolutionsContext()
  yield* Effect.logInfo(`effect-first context: ${effectFirstCtx.length} chars`)
  yield* Effect.logInfo(`opensrc context: ${opensrcCtx.length} chars`)
  yield* Effect.logInfo(`effect.solutions context: ${effectSolutionsCtx.length} chars`)

  const results: ConditionResult[] = []

  for (const task of tasks) {
    yield* Effect.logInfo(`\n--- ${task} ---`)
    const prompt = yield* readFile(`${process.cwd()}/bench/${task}/prompt.md`)
    const scores: Record<string, ScoreResult> = {}

    for (const condition of conditions) {
      let fullPrompt: string
      if (condition === "baseline") {
        fullPrompt = prompt
      } else if (condition === "effect-first") {
        fullPrompt = `${effectFirstCtx}\n\nTASK:\n${prompt}`
      } else if (condition === "opensrc") {
        fullPrompt = `Here is the Effect library source code for reference:\n\n${opensrcCtx}\n\nTASK:\n${prompt}`
      } else {
        fullPrompt = `Here is the Effect Solutions guide for writing idiomatic Effect code:\n\n${effectSolutionsCtx}\n\nTASK:\n${prompt}`
      }

      yield* Effect.logInfo(`  ${condition}...`)
      const output = yield* callModel(fullPrompt, apiKey)

      // Save output
      const fs = yield* FileSystem.FileSystem
      yield* fs.writeFileString(
        `${process.cwd()}/bench/${task}/${condition}-${model.replace(/\./g, "-")}.ts`,
        output.trimEnd() + "\n"
      )

      const score = yield* scoreOutput(task, output)
      scores[condition] = score
      yield* Effect.logInfo(`    ${condition}: ${score.percentage}% (${score.passedRules}/${score.totalRules})`)
    }

    results.push({ task, scores })
  }

  // Format results
  const header = `| Task | Baseline | effect-first | opensrc | effect.solutions | ef \u0394 | os \u0394 | es \u0394 |`
  const divider = `| --- | --- | --- | --- | --- | --- | --- | --- |`
  const rows = results.map((r) => {
    const b = r.scores.baseline!
    const ef = r.scores["effect-first"]!
    const os = r.scores.opensrc!
    const es = r.scores["effect-solutions"]!
    const fmt = (s: ScoreResult) => `${s.percentage}% (${s.passedRules}/${s.totalRules})`
    const delta = (s: ScoreResult) => `${s.percentage - b.percentage >= 0 ? "+" : ""}${s.percentage - b.percentage}%`
    return `| ${r.task} | ${fmt(b)} | ${fmt(ef)} | ${fmt(os)} | ${fmt(es)} | ${delta(ef)} | ${delta(os)} | ${delta(es)} |`
  }).join("\n")

  const md = `# Three-Way Benchmark: baseline vs effect-first vs opensrc\n\nModel: ${model} | Temperature: 0.2\n\n${header}\n${divider}\n${rows}\n`

  const jsonData = results.map((r) => ({
    task: r.task,
    baseline: { pct: r.scores.baseline!.percentage, pass: r.scores.baseline!.passedRules, total: r.scores.baseline!.totalRules },
    "effect-first": { pct: r.scores["effect-first"]!.percentage, pass: r.scores["effect-first"]!.passedRules, total: r.scores["effect-first"]!.totalRules },
    opensrc: { pct: r.scores.opensrc!.percentage, pass: r.scores.opensrc!.passedRules, total: r.scores.opensrc!.totalRules },
  }))

  const fs = yield* FileSystem.FileSystem
  yield* fs.writeFileString(`${process.cwd()}/bench/THREE-WAY-RESULTS.md`, md)
  yield* fs.writeFileString(`${process.cwd()}/bench/three-way-results.json`, JSON.stringify({ model, results: jsonData }, null, 2))
  yield* Effect.logInfo(`\n${md}`)
  yield* Effect.logInfo("\nResults written to bench/THREE-WAY-RESULTS.md and bench/three-way-results.json")
})

NodeRuntime.runMain(program.pipe(Effect.provide(NodeFileSystem.layer)))
