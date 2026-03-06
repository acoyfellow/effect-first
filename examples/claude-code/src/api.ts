import { Data, Schema } from "effect"

export const CreateBookmarkRequest = Schema.Struct({
  url: Schema.String,
  label: Schema.String,
})

export const Bookmark = Schema.Struct({
  id: Schema.String,
  url: Schema.String,
  label: Schema.String,
})

export const decodeCreateBookmarkRequest = Schema.decodeUnknownSync(CreateBookmarkRequest)
export const decodeBookmark = Schema.decodeUnknownSync(Bookmark)

export class InvalidBookmarkRequestError extends Data.TaggedError("InvalidBookmarkRequestError")<{
  readonly message: string
}> {}
