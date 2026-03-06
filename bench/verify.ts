import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createResults } from "./compute-results.js"
import { requiredTruthStatements } from "./live-support.js"

const here = path.dirname(fileURLToPath(import.meta.url))

const stableStringify = (value: unknown) => JSON.stringify(value, null, 2)

const main = async () => {
  const expected = await createResults()
  const benchArtifact = JSON.parse(
    await readFile(path.join(here, "results.json"), "utf8")
  )
  const kitArtifact = JSON.parse(
    await readFile(path.join(here, "..", "kit", "evals", "results.json"), "utf8")
  )

  const expectedString = stableStringify(expected)

  if (stableStringify(benchArtifact) !== expectedString) {
    throw new Error("bench/results.json does not match the reproducible benchmark output")
  }

  if (stableStringify(kitArtifact) !== expectedString) {
    throw new Error("kit/evals/results.json does not match the reproducible benchmark output")
  }

  const repoRoot = path.join(here, "..")

  for (const requirement of requiredTruthStatements) {
    const filePath = path.join(repoRoot, requirement.file)
    const source = await readFile(filePath, "utf8")

    if (!source.includes(requirement.snippet)) {
      throw new Error(
        `${requirement.file} is missing the required truth statement: ${requirement.snippet}`
      )
    }
  }

  console.log("Benchmark and truthfulness artifacts verified.")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
