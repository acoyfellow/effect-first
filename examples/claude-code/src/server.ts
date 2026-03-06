import { Effect } from "effect"
import { handleCreateBookmark, handleListBookmarks } from "./api-handlers.js"

const program = Effect.gen(function* () {
  const created = yield* handleCreateBookmark({
    url: "https://effect.website",
    label: "Effect",
  })
  const existing = yield* handleListBookmarks
  return {
    created,
    existingCount: existing.length,
  }
})

Effect.runPromise(program).then((result) => {
  console.log(result)
})
