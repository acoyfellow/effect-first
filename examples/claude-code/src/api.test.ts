import { HttpApiBuilder, HttpApiClient } from "@effect/platform"
import { NodeHttpServer } from "@effect/platform-node"
import { it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { expect } from "vitest"
import { BookmarksApi } from "./api.js"
import { ApiLive } from "./api-handlers.js"

const TestApiLive = HttpApiBuilder.serve().pipe(
  Layer.provide(NodeHttpServer.layerTest),
  Layer.provide(ApiLive)
)

it.effect("creates and lists bookmarks", () =>
  Effect.gen(function* () {
    const client = yield* HttpApiClient.make(BookmarksApi)

    const created = yield* client.bookmarks.create({
      payload: { url: "https://effect.website", title: "Effect" },
    })
    expect(created.url).toBe("https://effect.website")
    expect(created.title).toBe("Effect")

    const all = yield* client.bookmarks.list({})
    expect(all).toHaveLength(1)
    expect(all[0]!.id).toBe(created.id)
  }).pipe(Effect.provide(TestApiLive))
)

it.effect("finds bookmark by id", () =>
  Effect.gen(function* () {
    const client = yield* HttpApiClient.make(BookmarksApi)

    const created = yield* client.bookmarks.create({
      payload: { url: "https://github.com", title: "GitHub" },
    })

    const found = yield* client.bookmarks.findById({ path: { id: created.id } })
    expect(found.title).toBe("GitHub")
  }).pipe(Effect.provide(TestApiLive))
)

it.effect("returns 404 for missing bookmark", () =>
  Effect.gen(function* () {
    const client = yield* HttpApiClient.make(BookmarksApi)
    const result = yield* client.bookmarks
      .findById({ path: { id: "missing" } })
      .pipe(Effect.flip)
    expect(result._tag).toBe("BookmarkNotFoundError")
  }).pipe(Effect.provide(TestApiLive))
)

it.effect("deletes a bookmark", () =>
  Effect.gen(function* () {
    const client = yield* HttpApiClient.make(BookmarksApi)

    const created = yield* client.bookmarks.create({
      payload: { url: "https://example.com", title: "Example" },
    })
    yield* client.bookmarks.remove({ path: { id: created.id } })

    const all = yield* client.bookmarks.list({})
    const ids = all.map((bookmark) => bookmark.id)
    expect(ids).not.toContain(created.id)
  }).pipe(Effect.provide(TestApiLive))
)

it.effect("rejects duplicate URLs", () =>
  Effect.gen(function* () {
    const client = yield* HttpApiClient.make(BookmarksApi)

    yield* client.bookmarks.create({
      payload: { url: "https://dupe.com", title: "First" },
    })

    const result = yield* client.bookmarks
      .create({ payload: { url: "https://dupe.com", title: "Second" } })
      .pipe(Effect.flip)
    expect(result._tag).toBe("DuplicateBookmarkError")
  }).pipe(Effect.provide(TestApiLive))
)
