import { HttpApiBuilder } from "@effect/platform"
import { Effect, Layer } from "effect"
import { BookmarksApi, type BookmarkId } from "./api.js"
import { BookmarkRepo } from "./bookmark-repo.js"

export const BookmarksGroupLive = HttpApiBuilder.group(
  BookmarksApi,
  "bookmarks",
  (handlers) =>
    handlers
      .handle("list", () =>
        Effect.gen(function* () {
          const repo = yield* BookmarkRepo
          return yield* repo.list()
        })
      )
      .handle("findById", ({ path }) =>
        Effect.gen(function* () {
          const repo = yield* BookmarkRepo
          return yield* repo.findById(path.id as BookmarkId)
        })
      )
      .handle("create", ({ payload }) =>
        Effect.gen(function* () {
          const repo = yield* BookmarkRepo
          return yield* repo.create(payload.url, payload.title)
        })
      )
      .handle("remove", ({ path }) =>
        Effect.gen(function* () {
          const repo = yield* BookmarkRepo
          return yield* repo.remove(path.id as BookmarkId)
        })
      )
)

export const ApiLive = HttpApiBuilder.api(BookmarksApi).pipe(
  Layer.provide(BookmarksGroupLive),
  Layer.provide(BookmarkRepo.layer)
)
