import { makeRuntime, monitorProgram } from "./health-checker.js"

const runtime = makeRuntime()

runtime
  .runPromise(monitorProgram)
  .then(async (report) => {
    console.log(report)
    await runtime.dispose()
  })
  .catch(async (error) => {
    console.error(error)
    await runtime.dispose()
    process.exit(1)
  })
