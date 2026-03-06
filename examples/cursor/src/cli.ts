import { Effect } from "effect"
import { validateProfile } from "./validator.js"

const program = validateProfile({
  name: process.argv[2] ?? "Jordan",
  retries: Number(process.argv[3] ?? "2"),
})

Effect.runPromise(program).then((profile) => {
  console.log(profile)
})
