import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import ts from "typescript"
import {
  createClaimSummary,
  createLiveEvaluationSummary,
  parseLiveArtifact,
} from "./live-support.js"
import type { Score } from "./v4-lib.js"
import { arms, tasks, type Arm } from "./tasks.js"

const here = path.dirname(fileURLToPath(import.meta.url))

type JudgeModule = {
  readonly score: (source: string) => Score
}

type CompileResult = {
  readonly passed: boolean
  readonly diagnostics: ReadonlyArray<string>
}

const sha256 = (value: string) =>
  createHash("sha256").update(value).digest("hex")

const average = (values: ReadonlyArray<number>) =>
  Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)

const normalizeDiagnostic = (diagnostic: ts.Diagnostic) =>
  ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")

const compileFile = (filePath: string): CompileResult => {
  const program = ts.createProgram([filePath], {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    moduleDetection: ts.ModuleDetectionKind.Force,
    strict: true,
    exactOptionalPropertyTypes: true,
    noImplicitOverride: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    skipLibCheck: true,
    noEmit: true,
  })

  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .map(normalizeDiagnostic)
    .filter((message, index, all) => all.indexOf(message) === index)

  return {
    passed: diagnostics.length === 0,
    diagnostics,
  }
}

export const createResults = async () => {
  const liveArtifactFile = path.join(here, "live", "results.json")
  const liveArtifact = parseLiveArtifact(
    JSON.parse(await readFile(liveArtifactFile, "utf8"))
  )
  const claim = createClaimSummary(liveArtifact)
  const liveEvaluation = createLiveEvaluationSummary(liveArtifact)

  const taskResults = await Promise.all(
    tasks.map(async ([id, name]) => {
      const dir = path.join(here, id)
      const promptFile = path.join(dir, "prompt.md")
      const judgeFile = path.join(dir, "judge.ts")
      const promptSource = await readFile(promptFile, "utf8")
      const judgeSource = await readFile(judgeFile, "utf8")
      const judge = (await import(pathToFileURL(judgeFile).href)) as JudgeModule

      const armEntries = await Promise.all(
        arms.map(async (arm) => {
          const sourceFile = path.join(dir, `${arm}.ts`)
          const source = await readFile(sourceFile, "utf8")
          const score = judge.score(source)
          const compile = compileFile(sourceFile)

          return [
            arm,
            {
              sourceFile: path.relative(path.join(here, ".."), sourceFile),
              sourceSha256: sha256(source),
              score,
              compile,
            },
          ] as const
        })
      )

      const details = Object.fromEntries(armEntries) as Record<
        Arm,
        {
          readonly sourceFile: string
          readonly sourceSha256: string
          readonly score: Score
          readonly compile: CompileResult
        }
      >

      const scores = Object.fromEntries(
        arms.map((arm) => [arm, details[arm].score.percentage])
      ) as Record<Arm, number>

      const compile = Object.fromEntries(
        arms.map((arm) => [arm, details[arm].compile.passed])
      ) as Record<Arm, boolean>

      const checks = Object.fromEntries(
        arms.map((arm) => [arm, details[arm].score.checks])
      ) as Record<Arm, Score["checks"]>

      return {
        id,
        name,
        promptFile: path.relative(path.join(here, ".."), promptFile),
        promptSha256: sha256(promptSource),
        judgeFile: path.relative(path.join(here, ".."), judgeFile),
        judgeSha256: sha256(judgeSource),
        scores,
        compile,
        checks,
        details,
      }
    })
  )

  const sourceDigest = sha256(
    JSON.stringify(
      taskResults.map((task) => ({
        id: task.id,
        promptSha256: task.promptSha256,
        judgeSha256: task.judgeSha256,
        sourceSha256: Object.fromEntries(
          arms.map((arm) => [arm, task.details[arm].sourceSha256])
        ),
      }))
    )
  )

  return {
    version: 5,
    sourceDigest,
    claim,
    liveEvaluation,
    reproducibility: {
      command: "npm run bench",
      verificationCommand: "npm run bench:verify",
      liveVerificationCommand: "npm run live:verify",
      artifactFiles: [
        "bench/results.json",
        "kit/evals/results.json",
        "bench/live/results.json",
      ],
      compiler: {
        typescript: ts.version,
        mode: "TypeScript strict noEmit",
        options: [
          "strict",
          "exactOptionalPropertyTypes",
          "noImplicitOverride",
          "noUnusedLocals",
          "noUnusedParameters",
          "skipLibCheck",
          "noEmit",
        ],
      },
      scoring:
        "Deterministic AST-based structural judges plus per-file strict TypeScript noEmit compile checks.",
    },
    summary: {
      tasks: taskResults.length,
      dimensions: [
        "apiCorrectness",
        "idiomaticPatterns",
        "antiPatterns",
        "taskCompletion",
        "compileReadiness",
      ],
      arms: [...arms],
      aggregate: {
        baseline: average(taskResults.map((task) => task.scores.baseline)),
        "website-bootstrap-plus-kit": average(
          taskResults.map((task) => task.scores["website-bootstrap-plus-kit"])
        ),
        "direct-source-on-disk": average(
          taskResults.map((task) => task.scores["direct-source-on-disk"])
        ),
      },
      compilePassCounts: {
        baseline: taskResults.filter((task) => task.compile.baseline).length,
        "website-bootstrap-plus-kit": taskResults.filter(
          (task) => task.compile["website-bootstrap-plus-kit"]
        ).length,
        "direct-source-on-disk": taskResults.filter(
          (task) => task.compile["direct-source-on-disk"]
        ).length,
      },
    },
    tasks: taskResults,
  } as const
}
