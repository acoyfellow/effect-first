import { Effect, Layer, ServiceMap } from "effect"
import { decodeBookmark } from "./api.js"

type BookmarkRecord = ReturnType<typeof decodeBookmark>

const seedBookmarks = (): Array<BookmarkRecord> => [
  decodeBookmark({
    id: "bookmark-1",
    url: "https://effect.website",
    label: "Effect docs",
  }),
]

export class BookmarkRepo extends ServiceMap.Service<BookmarkRepo, {
  readonly create: (input: { readonly url: string; readonly label: string }) => Effect.Effect<BookmarkRecord>
  readonly list: Effect.Effect<Array<BookmarkRecord>>
}>()("BookmarkRepo") {}

export const BookmarkRepoLive = Layer.succeed(BookmarkRepo)({
  create: (input) =>
    Effect.succeed(
      decodeBookmark({
        id: `bookmark-${input.label.toLowerCase().replace(/\s+/g, "-")}`,
        url: input.url,
        label: input.label,
      })
    ),
  list: Effect.succeed(seedBookmarks()),
})
