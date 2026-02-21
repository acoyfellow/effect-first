import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"

export const BookmarkId = Schema.String.pipe(Schema.brand("BookmarkId"))
export type BookmarkId = typeof BookmarkId.Type

export class Bookmark extends Schema.Class<Bookmark>("Bookmark")({
  id: BookmarkId,
  url: Schema.String,
  title: Schema.String,
}) {}

export class BookmarkNotFoundError extends Schema.TaggedError<BookmarkNotFoundError>()(
  "BookmarkNotFoundError",
  { id: Schema.String }
) {}

export class DuplicateBookmarkError extends Schema.TaggedError<DuplicateBookmarkError>()(
  "DuplicateBookmarkError",
  { url: Schema.String }
) {}

export class BookmarksGroup extends HttpApiGroup.make("bookmarks")
  .add(
    HttpApiEndpoint.get("list", "/bookmarks").addSuccess(Schema.Array(Bookmark))
  )
  .add(
    HttpApiEndpoint.get("findById", "/bookmarks/:id")
      .setPath(Schema.Struct({ id: Schema.String }))
      .addSuccess(Bookmark)
      .addError(BookmarkNotFoundError, { status: 404 })
  )
  .add(
    HttpApiEndpoint.post("create", "/bookmarks")
      .setPayload(
        Schema.Struct({
          url: Schema.String,
          title: Schema.NonEmptyString,
        })
      )
      .addSuccess(Bookmark, { status: 201 })
      .addError(DuplicateBookmarkError, { status: 409 })
  )
  .add(
    HttpApiEndpoint.del("remove", "/bookmarks/:id")
      .setPath(Schema.Struct({ id: Schema.String }))
      .addSuccess(Schema.Void)
      .addError(BookmarkNotFoundError, { status: 404 })
  )
  .prefix("/api") {}

export class BookmarksApi extends HttpApi.make("bookmarksApi").add(BookmarksGroup) {}
