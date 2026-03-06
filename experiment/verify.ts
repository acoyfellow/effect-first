import { createHash } from "node:crypto"
import { readFile, stat } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

type RunVerdict = {
  readonly artifactDir: string
  readonly compiled: boolean | null
  readonly testsPassed: boolean | null
  readonly testCommand: string | null
  readonly exitCode: number | null
  readonly durationMs: number | null
}

type TrialResult = {
  readonly trialId: string
  readonly baseline: RunVerdict
  readonly localOnly: RunVerdict
  readonly winner: "baseline" | "local-only" | "tie" | "neither" | null
}

type ExperimentResults = {
  readonly version: number
  readonly status: "not-run" | "running" | "complete"
  readonly hypothesis: string
  readonly taskId: string
  readonly arms: ReadonlyArray<string>
  readonly trials: number
  readonly primaryMetric: "acceptance-test-pass-rate"
  readonly strictWinRule: string
  readonly frozenInputs: {
    readonly deadline: string
    readonly files: Record<string, string>
  }
  readonly outcome: "unproven" | "keep-investigating" | "kill"
  readonly summary: string
  readonly trialResults: ReadonlyArray<TrialResult>
  readonly recommendedAction: string
}

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, "..")

const sha256File = async (filePath: string) =>
  createHash("sha256").update(await readFile(filePath)).digest("hex")

const pathExists = async (filePath: string) => {
  try {
    await stat(filePath)
    return true
  } catch {
    return false
  }
}

const expectFile = async (relativePath: string) => {
  const filePath = path.join(repoRoot, relativePath)

  if (!(await pathExists(filePath))) {
    throw new Error(`Missing required file: ${relativePath}`)
  }

  return filePath
}

const validateNotRunTrial = (trial: TrialResult) => {
  for (const verdict of [trial.baseline, trial.localOnly]) {
    if (
      verdict.compiled !== null ||
      verdict.testsPassed !== null ||
      verdict.testCommand !== null ||
      verdict.exitCode !== null ||
      verdict.durationMs !== null
    ) {
      throw new Error(`Not-run trials must have null verdict fields: ${trial.trialId}`)
    }
  }

  if (trial.winner !== null) {
    throw new Error(`Not-run trials must have winner = null: ${trial.trialId}`)
  }
}

const validateCompleteOutcome = (results: ExperimentResults) => {
  const winners = results.trialResults.map((trial) => trial.winner)
  const strictLocalOnly = winners.every((winner) => winner === "local-only")

  if (strictLocalOnly && results.outcome !== "keep-investigating") {
    throw new Error("All-local-only wins must produce keep-investigating")
  }

  if (!strictLocalOnly && results.outcome !== "kill") {
    throw new Error("Any non-strict-win complete result must be kill")
  }
}

export const verifyExperiment = async () => {
  const resultsPath = await expectFile("experiment/results.json")
  const results = JSON.parse(
    await readFile(resultsPath, "utf8")
  ) as ExperimentResults

  if (results.version !== 1) {
    throw new Error("experiment/results.json version must be 1")
  }

  if (results.taskId !== "todo-repo-local-only-001") {
    throw new Error("experiment taskId must be todo-repo-local-only-001")
  }

  if (JSON.stringify(results.arms) !== JSON.stringify(["baseline", "local-only"])) {
    throw new Error("experiment arms must be [baseline, local-only]")
  }

  if (results.trials !== 3) {
    throw new Error("experiment must define exactly 3 trials")
  }

  if (results.primaryMetric !== "acceptance-test-pass-rate") {
    throw new Error("experiment primaryMetric must be acceptance-test-pass-rate")
  }

  if (results.trialResults.length !== 3) {
    throw new Error("experiment must carry exactly 3 trialResults")
  }

  const baselineContextPath = await expectFile("experiment/contexts/baseline.txt")
  const localOnlyContextPath = await expectFile("experiment/contexts/local-only.txt")
  await expectFile("experiment/task/prompt.md")
  await expectFile("experiment/task/fixture/package.json")
  await expectFile("experiment/task/fixture/tsconfig.json")
  await expectFile("experiment/task/fixture/src/errors.ts")
  await expectFile("experiment/task/fixture/src/schema.ts")
  await expectFile("experiment/task/fixture/src/todo-repo.ts")
  await expectFile("experiment/task/fixture/src/todo-repo.test.ts")
  await expectFile("experiment/PROTOCOL.md")
  await expectFile("experiment/README.md")
  await expectFile("experiment/RESULTS.md")

  const baselineContext = await readFile(baselineContextPath, "utf8")
  if (baselineContext.includes("examples/")) {
    throw new Error("baseline context must not reference example files")
  }

  const localOnlyContext = await readFile(localOnlyContextPath, "utf8")
  const expectedLocalOnly = `Use the exact task prompt from \`experiment/task/prompt.md\`.

Then read only these repo-local files, in this exact order:

1. \`examples/codex/README.md\`
2. \`examples/codex/AGENTS.md\`
3. \`examples/codex/src/errors.ts\`
4. \`examples/codex/src/schema.ts\`
5. \`examples/codex/src/todo-repo.ts\`
6. \`examples/codex/src/todo-repo.test.ts\`

Do not use any website route, retired bootstrap content, or any other repo file as part of the intervention.

Capture these artifacts for each local-only run:

- \`context.txt\`
- \`prompt.txt\`
- \`transcript.md\`
- \`output/todo-repo.ts\`
- \`metadata.json\`
- \`verdict.json\`
`

  if (localOnlyContext !== expectedLocalOnly) {
    throw new Error("local-only context must match the frozen file list exactly")
  }

  for (const [relativePath, expectedHash] of Object.entries(results.frozenInputs.files)) {
    const filePath = await expectFile(relativePath)
    const actualHash = await sha256File(filePath)

    if (expectedHash.length !== 64) {
      throw new Error(`Frozen input hash must be a 64-char sha256: ${relativePath}`)
    }

    if (actualHash !== expectedHash) {
      throw new Error(`Frozen input hash mismatch: ${relativePath}`)
    }
  }

  for (const [index, trial] of results.trialResults.entries()) {
    const expectedTrialId = `trial-${index + 1}`
    if (trial.trialId !== expectedTrialId) {
      throw new Error(`Trial order mismatch: expected ${expectedTrialId}`)
    }

    for (const verdict of [trial.baseline, trial.localOnly]) {
      const dirPath = path.join(repoRoot, verdict.artifactDir)
      if (!(await pathExists(dirPath))) {
        throw new Error(`Missing artifact directory: ${verdict.artifactDir}`)
      }
    }

    if (results.status !== "complete") {
      validateNotRunTrial(trial)
    }
  }

  if (results.status === "not-run") {
    if (results.outcome !== "unproven") {
      throw new Error("Not-run experiments must remain unproven")
    }
  }

  if (results.status === "complete") {
    validateCompleteOutcome(results)

    for (const trial of results.trialResults) {
      for (const verdict of [
        ["baseline", trial.baseline],
        ["local-only", trial.localOnly],
      ] as const) {
        const requiredFiles = [
          "context.txt",
          "prompt.txt",
          "transcript.md",
          path.join("output", "todo-repo.ts"),
          "metadata.json",
          "verdict.json",
        ]

        for (const requiredFile of requiredFiles) {
          const filePath = path.join(repoRoot, verdict[1].artifactDir, requiredFile)
          if (!(await pathExists(filePath))) {
            throw new Error(`Missing ${verdict[0]} run artifact: ${path.join(verdict[1].artifactDir, requiredFile)}`)
          }
        }
      }
    }
  }

  console.log("Restart experiment artifacts verified.")
}

verifyExperiment().catch((error) => {
  console.error(error)
  process.exit(1)
})
