import { Effect } from "effect"
import { BookmarkRepo, BookmarkRepoLive } from "./bookmark-repo.js"
import {
  decodeCreateBookmarkRequest,
  InvalidBookmarkRequestError,
} from "./api.js"

export const handleCreateBookmark = (input: unknown) =>
  Effect.gen(function* () {
    const request = yield* Effect.try({
      try: () => decodeCreateBookmarkRequest(input),
      catch: (error) =>
        new InvalidBookmarkRequestError({
          message:
            error instanceof Error ? error.message : "bookmark request is invalid",
        }),
    })
    const repo = yield* BookmarkRepo
    return yield* repo.create(request)
  }).pipe(Effect.provide(BookmarkRepoLive))

export const handleListBookmarks = Effect.gen(function* () {
  const repo = yield* BookmarkRepo
  return yield* repo.list
}).pipe(Effect.provide(BookmarkRepoLive))
