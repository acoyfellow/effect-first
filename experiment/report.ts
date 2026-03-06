import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

type TrialResult = {
  readonly trialId: string
  readonly winner: "baseline" | "local-only" | "tie" | "neither" | null
}

type ExperimentResults = {
  readonly status: string
  readonly outcome: string
  readonly recommendedAction: string
  readonly summary: string
  readonly taskId: string
  readonly trialResults: ReadonlyArray<TrialResult>
}

const here = path.dirname(fileURLToPath(import.meta.url))

const main = async () => {
  const results = JSON.parse(
    await readFile(path.join(here, "results.json"), "utf8")
  ) as ExperimentResults

  console.log(
    JSON.stringify(
      {
        taskId: results.taskId,
        status: results.status,
        outcome: results.outcome,
        recommendedAction: results.recommendedAction,
        summary: results.summary,
        winners: results.trialResults.map((trial) => ({
          trialId: trial.trialId,
          winner: trial.winner,
        })),
      },
      null,
      2
    )
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
