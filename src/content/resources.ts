export const RESOURCES_TEXT = `# Effect-First TypeScript — Resources & Scope

## Imports

    import { Effect, Layer, Scope, Pool, ScopedRef } from "effect"

## acquireRelease

    const file = yield* Effect.acquireRelease(
      openFile(path),
      (handle) => closeFile(handle)
    )

    const program = Effect.acquireUseRelease(
      connectDb,
      (db) => db.query("select * from users"),
      (db) => db.close
    )

## addFinalizer

    const program = Effect.gen(function* () {
      yield* Effect.addFinalizer(() => Effect.logInfo("cleanup"))
      return yield* doWork
    })

## Scope service

    const scoped = Effect.scoped(
      Effect.gen(function* () {
        const scope = yield* Scope.Scope
        return scope
      })
    )

## Layer.scoped

    class Connection extends Context.Tag("@app/Connection")<
      Connection,
      { readonly query: (sql: string) => Effect.Effect<unknown[]> }
    >() {}

    const ConnectionLive = Layer.scoped(
      Connection,
      Effect.acquireRelease(connectDb, (db) => db.close)
    )

## Pools

    const pool = yield* Pool.make({
      acquire: connectDb,
      size: 10,
      timeToLive: "10 minutes",
      concurrency: 2,
    })

    const db = yield* Pool.get(pool)

## ScopedRef

    const ref = yield* ScopedRef.fromAcquire(connectDb)
    const db = yield* ScopedRef.get(ref)
`
