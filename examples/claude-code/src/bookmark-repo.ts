import { Context, Effect, Layer } from "effect"
import {
  Bookmark,
  type BookmarkId,
  BookmarkNotFoundError,
  DuplicateBookmarkError,
} from "./api.js"

export class BookmarkRepo extends Context.Tag("@example/BookmarkRepo")<
  BookmarkRepo,
  {
    readonly list: () => Effect.Effect<ReadonlyArray<Bookmark>>
    readonly findById: (id: BookmarkId) => Effect.Effect<Bookmark, BookmarkNotFoundError>
    readonly create: (url: string, title: string) => Effect.Effect<Bookmark, DuplicateBookmarkError>
    readonly remove: (id: BookmarkId) => Effect.Effect<void, BookmarkNotFoundError>
  }
>() {
  static readonly layer = Layer.sync(BookmarkRepo, () => {
    const store = new Map<BookmarkId, Bookmark>()
    let counter = 0

    return BookmarkRepo.of({
      list: Effect.fn("BookmarkRepo.list")(function* () {
        return Array.from(store.values())
      }),

      findById: Effect.fn("BookmarkRepo.findById")(function* (id: BookmarkId) {
        const bookmark = store.get(id)
        if (!bookmark) return yield* new BookmarkNotFoundError({ id })
        return bookmark
      }),

      create: Effect.fn("BookmarkRepo.create")(function* (url: string, title: string) {
        for (const existing of store.values()) {
          if (existing.url === url) {
            return yield* new DuplicateBookmarkError({ url })
          }
        }
        const id = String(++counter) as BookmarkId
        const bookmark = new Bookmark({ id, url, title })
        store.set(id, bookmark)
        yield* Effect.logInfo(`Created bookmark ${id}: ${title}`)
        return bookmark
      }),

      remove: Effect.fn("BookmarkRepo.remove")(function* (id: BookmarkId) {
        if (!store.has(id)) return yield* new BookmarkNotFoundError({ id })
        store.delete(id)
        yield* Effect.logInfo(`Removed bookmark ${id}`)
      }),
    })
  })
}
