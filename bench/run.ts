import { writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createResults } from "./compute-results.js"

const here = path.dirname(fileURLToPath(import.meta.url))

const run = async () => {
  const results = await createResults()
  const json = `${JSON.stringify(results, null, 2)}\n`

  await writeFile(path.join(here, "results.json"), json)
  await writeFile(path.join(here, "..", "kit", "evals", "results.json"), json)

  console.log(json)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
