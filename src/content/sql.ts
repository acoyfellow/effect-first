export const SQL_TEXT = `# Effect-First TypeScript — SQL (@effect/sql)

@effect/sql provides a tagged template literal SQL client, schema-validated queries, batched resolvers, and a Model system for domain objects with insert/update/json variants.

Package: @effect/sql (SqlClient, SqlSchema, SqlResolver, Model, Migrator)
DB adapters: @effect/sql-pg, @effect/sql-sqlite-node, @effect/sql-mysql2, @effect/sql-mssql


## Imports

    import { SqlClient, SqlSchema, SqlResolver, Model } from "@effect/sql"
    import { PgClient } from "@effect/sql-pg"        // or SqliteClient, etc.
    import { Effect, Schema } from "effect"


## SqlClient — tagged template queries

    const program = Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient

      // select — returns ReadonlyArray<unknown>
      const rows = yield* sql\`SELECT * FROM users WHERE id = \${userId}\`

      // insert
      yield* sql\`INSERT INTO users \${sql.insert({ id, name, email })}\`

      // update
      yield* sql\`UPDATE users SET \${sql.update({ name, email })} WHERE id = \${id}\`

      // transactions
      yield* sql.withTransaction(
        Effect.gen(function* () {
          yield* sql\`INSERT INTO orders \${sql.insert(order)}\`
          yield* sql\`UPDATE inventory SET qty = qty - 1 WHERE id = \${itemId}\`
        })
      )
    })


## SqlSchema — validated queries

    import { SqlClient, SqlSchema } from "@effect/sql"
    import { Effect, Schema } from "effect"

    const findUserById = SqlSchema.findOne({
      Request: Schema.String,
      Result: User,
      execute: (id) => Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient
        return yield* sql\`SELECT * FROM users WHERE id = \${id}\`
      }),
    })

    // SqlSchema variants:
    // SqlSchema.findAll    — returns ReadonlyArray<A>
    // SqlSchema.findOne    — returns Option<A>
    // SqlSchema.single     — returns A (throws NoSuchElementException if missing)
    // SqlSchema.void       — discards result


## Model — domain objects with variants

    import { Model } from "@effect/sql"
    import { Schema } from "effect"

    const GroupId = Schema.Number.pipe(Schema.brand("GroupId"))

    class Group extends Model.Class<Group>("Group")({
      id: Model.Generated(GroupId),
      name: Schema.NonEmptyTrimmedString,
      createdAt: Model.DateTimeInsertFromDate,
      updatedAt: Model.DateTimeUpdateFromDate,
    }) {}

    // Variants auto-generated:
    // Group            — select schema (all fields)
    // Group.insert     — insert schema (id omitted, createdAt auto)
    // Group.update     — update schema (all optional, updatedAt auto)
    // Group.json       — JSON API schema
    // Group.jsonCreate — JSON create schema
    // Group.jsonUpdate — JSON update schema

    // Model field helpers:
    // Model.Generated(schema)              — omit from insert
    // Model.GeneratedByApp(schema)         — required in insert, not from DB
    // Model.DateTimeInsertFromDate         — auto DateTime on insert
    // Model.DateTimeUpdateFromDate         — auto DateTime on update
    // Model.Sensitive(schema)              — omit from json variants
    // Model.FieldOption(schema)            — Option<A> field
    // Model.JsonFromString(schema)         — JSON stored as string column


## SqlResolver — batched queries with Effect Request

    const UserById = SqlResolver.findById("UserById", {
      Id: UserId,
      Result: User,
      ResultId: (user) => user.id,
      execute: (ids) => Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient
        return yield* sql\`SELECT * FROM users WHERE id IN \${sql.in(ids)}\`
      }),
    })

    // Use:
    const user = yield* UserById.execute(userId)

    // SqlResolver variants:
    // SqlResolver.findById   — returns Option<A>, keyed by ID
    // SqlResolver.ordered    — results match request order 1:1
    // SqlResolver.grouped    — group results by key (1:many)
    // SqlResolver.void       — batched writes, no result


## Model.makeRepository — CRUD from Model

    const GroupRepo = Model.makeRepository(Group, {
      tableName: "groups",
      spanPrefix: "GroupRepo",
      idColumn: "id",
    })

    // Provides: findById, insert, update, delete, etc.


## Layers (provide at entry point)

    // PostgreSQL
    import { PgClient } from "@effect/sql-pg"
    const DbLive = PgClient.layer({ url: "postgres://localhost/mydb" })

    // SQLite
    import { SqliteClient } from "@effect/sql-sqlite-node"
    const DbLive = SqliteClient.layer({ filename: "./data.db" })

    // Always assign to a const — memoization by reference
    Effect.runPromise(program.pipe(Effect.provide(DbLive)))


## Anti-patterns

WRONG: String concatenation for SQL queries
RIGHT: Tagged template: sql\`SELECT * FROM users WHERE id = \${id}\` (auto-parameterized)

WRONG: Manual row-to-object mapping
RIGHT: SqlSchema.findAll/findOne with Schema for validated decoding

WRONG: N+1 queries in loops
RIGHT: SqlResolver.findById / SqlResolver.grouped for automatic batching

WRONG: Separate type definitions for insert vs select
RIGHT: Model.Class generates all variants (select, insert, update, json) from one definition

WRONG: Manual transaction begin/commit/rollback
RIGHT: sql.withTransaction(effect) handles commit/rollback automatically
`
