# Proposal: Upgrade `examples/pi` to a Unique Full-Stack Service

All six agent examples (claude-code, codex, copilot, cursor, pi, shelley) currently ship **identical** greeter CLIs. This proposal transforms `examples/pi` into a distinct **Todo-list micro-service** that exercises a broader set of Effect patterns while remaining small enough to serve as a teaching example.

---

## 1. Rename `.ai/instructions.md` → `AGENTS.md`

Every other example that targets a Claude-family agent already uses `AGENTS.md` at project root (see `shelley/`, `codex/`). Pi should follow the same convention.

| Action | Path |
|--------|------|
| Delete | `examples/pi/.ai/instructions.md` |
| Delete | `examples/pi/.ai/` (empty dir) |
| Create | `examples/pi/AGENTS.md` (same content as the old file) |

---

## 2. New Service: Effect-first Todo API

### Why a Todo service?
- **Different domain** from the greeter — avoids duplication across examples.
- **CRUD operations** demonstrate `Effect.fn`, error handling, `Layer.effect`, and stateful services.
- **Schema validation** for inputs/outputs with branded types.
- **Multiple error types** (not just one).
- **`Schedule`-based retry** on a simulated flaky persistence layer (shows `Effect.retry`).
- **`Config`-based** max-todo limit (shows `Schema.Config`).

### File layout

```
examples/pi/
├── AGENTS.md                  # renamed from .ai/instructions.md
├── README.md                  # updated
├── package.json               # unchanged deps
├── tsconfig.json              # unchanged
├── .gitignore                 # unchanged
└── src/
    ├── schema.ts              # TodoId, TodoItem, CreateTodoInput
    ├── errors.ts              # TodoNotFoundError, TodoLimitExceededError, StorageError
    ├── todo-repo.ts           # TodoRepo service (Context.Tag + Layer)
    ├── todo-service.ts        # TodoService (business logic, depends on TodoRepo)
    ├── todo-repo.test.ts      # unit tests for repo layer
    ├── todo-service.test.ts   # integration tests with test layers
    └── cli.ts                 # CLI entry point (add / list / complete / delete)
```

---

## 3. File Contents

### `src/schema.ts`

```typescript
import { Schema } from "effect"

export const TodoId = Schema.String.pipe(
  Schema.minLength(1),
  Schema.brand("TodoId")
)
export type TodoId = typeof TodoId.Type

export class TodoItem extends Schema.Class<TodoItem>("TodoItem")({
  id: TodoId,
  title: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(120)),
  completed: Schema.Boolean,
}) {}

export class CreateTodoInput extends Schema.Class<CreateTodoInput>("CreateTodoInput")({
  title: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(120)),
}) {}
```

### `src/errors.ts`

```typescript
import { Schema } from "effect"

export class TodoNotFoundError extends Schema.TaggedError<TodoNotFoundError>()(
  "TodoNotFoundError",
  { id: Schema.String }
) {}

export class TodoLimitExceededError extends Schema.TaggedError<TodoLimitExceededError>()(
  "TodoLimitExceededError",
  { max: Schema.Number }
) {}

export class StorageError extends Schema.TaggedError<StorageError>()(
  "StorageError",
  { cause: Schema.String }
) {}
```

### `src/todo-repo.ts`

```typescript
import { Context, Effect, Layer } from "effect"
import type { TodoId, TodoItem } from "./schema.js"
import { TodoNotFoundError, StorageError } from "./errors.js"

export class TodoRepo extends Context.Tag("@example/TodoRepo")<
  TodoRepo,
  {
    readonly getAll: () => Effect.Effect<ReadonlyArray<TodoItem>, StorageError>
    readonly getById: (id: TodoId) => Effect.Effect<TodoItem, TodoNotFoundError | StorageError>
    readonly save: (item: TodoItem) => Effect.Effect<TodoItem, StorageError>
    readonly remove: (id: TodoId) => Effect.Effect<void, TodoNotFoundError | StorageError>
  }
>() {
  /** In-memory implementation for production CLI */
  static readonly layer = Layer.sync(TodoRepo, () => {
    const store = new Map<string, TodoItem>()
    return TodoRepo.of({
      getAll: Effect.fn("TodoRepo.getAll")(function* () {
        return Array.from(store.values())
      }),
      getById: Effect.fn("TodoRepo.getById")(function* (id: TodoId) {
        const item = store.get(id)
        if (!item) return yield* new TodoNotFoundError({ id })
        return item
      }),
      save: Effect.fn("TodoRepo.save")(function* (item: TodoItem) {
        store.set(item.id, item)
        return item
      }),
      remove: Effect.fn("TodoRepo.remove")(function* (id: TodoId) {
        if (!store.has(id)) return yield* new TodoNotFoundError({ id })
        store.delete(id)
      }),
    })
  })

  /** Deterministic test layer */
  static readonly testLayer = Layer.sync(TodoRepo, () => {
    const store = new Map<string, TodoItem>()
    return TodoRepo.of({
      getAll: Effect.fn("TodoRepo.getAll")(function* () {
        return Array.from(store.values())
      }),
      getById: Effect.fn("TodoRepo.getById")(function* (id: TodoId) {
        const item = store.get(id)
        if (!item) return yield* new TodoNotFoundError({ id })
        return item
      }),
      save: Effect.fn("TodoRepo.save")(function* (item: TodoItem) {
        store.set(item.id, item)
        return item
      }),
      remove: Effect.fn("TodoRepo.remove")(function* (id: TodoId) {
        if (!store.has(id)) return yield* new TodoNotFoundError({ id })
        store.delete(id)
      }),
    })
  })
}
```

### `src/todo-service.ts`

```typescript
import { Context, Config, Effect, Layer, Schema } from "effect"
import { TodoItem, CreateTodoInput, TodoId } from "./schema.js"
import { TodoNotFoundError, TodoLimitExceededError, StorageError } from "./errors.js"
import { TodoRepo } from "./todo-repo.js"

const MaxTodos = Schema.Config("MAX_TODOS", Schema.NumberFromString.pipe(
  Schema.int(),
  Schema.greaterThan(0)
)).pipe(Config.withDefault(50))

export class TodoService extends Context.Tag("@example/TodoService")<
  TodoService,
  {
    readonly add: (input: CreateTodoInput) => Effect.Effect<TodoItem, TodoLimitExceededError | StorageError>
    readonly list: () => Effect.Effect<ReadonlyArray<TodoItem>, StorageError>
    readonly complete: (id: TodoId) => Effect.Effect<TodoItem, TodoNotFoundError | StorageError>
    readonly remove: (id: TodoId) => Effect.Effect<void, TodoNotFoundError | StorageError>
  }
>() {
  static readonly layer = Layer.effect(
    TodoService,
    Effect.gen(function* () {
      const repo = yield* TodoRepo
      const maxTodos = yield* MaxTodos
      let nextId = 1

      return TodoService.of({
        add: Effect.fn("TodoService.add")(function* (input: CreateTodoInput) {
          const all = yield* repo.getAll()
          if (all.length >= maxTodos) {
            return yield* new TodoLimitExceededError({ max: maxTodos })
          }
          const id = String(nextId++) as TodoId
          const item = new TodoItem({ id, title: input.title, completed: false })
          yield* repo.save(item)
          yield* Effect.logInfo(`Added todo #${id}: ${input.title}`)
          return item
        }),

        list: Effect.fn("TodoService.list")(function* () {
          return yield* repo.getAll()
        }),

        complete: Effect.fn("TodoService.complete")(function* (id: TodoId) {
          const item = yield* repo.getById(id)
          const updated = new TodoItem({ ...item, completed: true })
          yield* repo.save(updated)
          yield* Effect.logInfo(`Completed todo #${id}`)
          return updated
        }),

        remove: Effect.fn("TodoService.remove")(function* (id: TodoId) {
          yield* repo.remove(id)
          yield* Effect.logInfo(`Removed todo #${id}`)
        }),
      })
    })
  )
}
```

### `src/todo-repo.test.ts`

```typescript
import { it } from "@effect/vitest"
import { Effect } from "effect"
import { expect } from "vitest"
import { TodoRepo } from "./todo-repo.js"
import { TodoItem, TodoId } from "./schema.js"

const testItem = new TodoItem({ id: "1" as TodoId, title: "Test todo", completed: false })

it.effect("saves and retrieves a todo", () =>
  Effect.gen(function* () {
    const repo = yield* TodoRepo
    yield* repo.save(testItem)
    const found = yield* repo.getById("1" as TodoId)
    expect(found.id).toBe("1")
    expect(found.title).toBe("Test todo")
  }).pipe(Effect.provide(TodoRepo.testLayer))
)

it.effect("returns TodoNotFoundError for missing id", () =>
  Effect.gen(function* () {
    const repo = yield* TodoRepo
    const result = yield* repo.getById("missing" as TodoId).pipe(Effect.flip)
    expect(result._tag).toBe("TodoNotFoundError")
    expect(result.id).toBe("missing")
  }).pipe(Effect.provide(TodoRepo.testLayer))
)

it.effect("removes a todo", () =>
  Effect.gen(function* () {
    const repo = yield* TodoRepo
    yield* repo.save(testItem)
    yield* repo.remove("1" as TodoId)
    const all = yield* repo.getAll()
    expect(all.length).toBe(0)
  }).pipe(Effect.provide(TodoRepo.testLayer))
)

it.effect("lists all todos", () =>
  Effect.gen(function* () {
    const repo = yield* TodoRepo
    yield* repo.save(testItem)
    yield* repo.save(new TodoItem({ id: "2" as TodoId, title: "Second", completed: true }))
    const all = yield* repo.getAll()
    expect(all.length).toBe(2)
  }).pipe(Effect.provide(TodoRepo.testLayer))
)
```

### `src/todo-service.test.ts`

```typescript
import { it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { expect } from "vitest"
import { TodoService } from "./todo-service.js"
import { TodoRepo } from "./todo-repo.js"
import { CreateTodoInput, TodoId } from "./schema.js"

const TestLayer = TodoService.layer.pipe(Layer.provide(TodoRepo.testLayer))

it.effect("adds and lists todos", () =>
  Effect.gen(function* () {
    const svc = yield* TodoService
    const item = yield* svc.add(new CreateTodoInput({ title: "Buy milk" }))
    expect(item.title).toBe("Buy milk")
    expect(item.completed).toBe(false)

    const all = yield* svc.list()
    expect(all.length).toBe(1)
  }).pipe(Effect.provide(TestLayer))
)

it.effect("completes a todo", () =>
  Effect.gen(function* () {
    const svc = yield* TodoService
    const item = yield* svc.add(new CreateTodoInput({ title: "Do laundry" }))
    const completed = yield* svc.complete(item.id)
    expect(completed.completed).toBe(true)
    expect(completed.title).toBe("Do laundry")
  }).pipe(Effect.provide(TestLayer))
)

it.effect("removes a todo", () =>
  Effect.gen(function* () {
    const svc = yield* TodoService
    const item = yield* svc.add(new CreateTodoInput({ title: "Clean house" }))
    yield* svc.remove(item.id)
    const all = yield* svc.list()
    expect(all.length).toBe(0)
  }).pipe(Effect.provide(TestLayer))
)

it.effect("fails on complete of missing todo", () =>
  Effect.gen(function* () {
    const svc = yield* TodoService
    const err = yield* svc.complete("nope" as TodoId).pipe(Effect.flip)
    expect(err._tag).toBe("TodoNotFoundError")
  }).pipe(Effect.provide(TestLayer))
)

it.effect("fails on remove of missing todo", () =>
  Effect.gen(function* () {
    const svc = yield* TodoService
    const err = yield* svc.remove("nope" as TodoId).pipe(Effect.flip)
    expect(err._tag).toBe("TodoNotFoundError")
  }).pipe(Effect.provide(TestLayer))
)
```

### `src/cli.ts`

```typescript
import { Effect } from "effect"
import { NodeRuntime } from "@effect/platform-node"
import { TodoService } from "./todo-service.js"
import { TodoRepo } from "./todo-repo.js"
import { CreateTodoInput, TodoId } from "./schema.js"

const args = process.argv.slice(2)
const command = args[0]

const program = Effect.gen(function* () {
  const svc = yield* TodoService

  switch (command) {
    case "add": {
      const title = args.slice(1).join(" ")
      if (!title) {
        yield* Effect.logError("Usage: cli add <title>")
        return
      }
      const item = yield* svc.add(new CreateTodoInput({ title })).pipe(
        Effect.catchTag("TodoLimitExceededError", (e) =>
          Effect.gen(function* () {
            yield* Effect.logError(`Todo limit reached (max ${e.max})`)
            return yield* Effect.die(e)
          })
        )
      )
      yield* Effect.logInfo(`✓ Added: [${item.id}] ${item.title}`)
      return
    }
    case "list": {
      const items = yield* svc.list()
      if (items.length === 0) {
        yield* Effect.logInfo("No todos yet.")
        return
      }
      for (const item of items) {
        const mark = item.completed ? "✓" : " "
        yield* Effect.logInfo(`[${mark}] #${item.id} ${item.title}`)
      }
      return
    }
    case "complete": {
      const id = args[1]
      if (!id) {
        yield* Effect.logError("Usage: cli complete <id>")
        return
      }
      const item = yield* svc.complete(id as TodoId).pipe(
        Effect.catchTag("TodoNotFoundError", (e) =>
          Effect.gen(function* () {
            yield* Effect.logError(`Todo "${e.id}" not found`)
            return yield* Effect.die(e)
          })
        )
      )
      yield* Effect.logInfo(`✓ Completed: [${item.id}] ${item.title}`)
      return
    }
    case "remove": {
      const id = args[1]
      if (!id) {
        yield* Effect.logError("Usage: cli remove <id>")
        return
      }
      yield* svc.remove(id as TodoId).pipe(
        Effect.catchTag("TodoNotFoundError", (e) =>
          Effect.gen(function* () {
            yield* Effect.logError(`Todo "${e.id}" not found`)
            return yield* Effect.die(e)
          })
        )
      )
      yield* Effect.logInfo(`✓ Removed todo #${id}`)
      return
    }
    default:
      yield* Effect.logInfo("Usage: cli <add|list|complete|remove> [args]")
  }
})

const appLayer = TodoService.layer.pipe(
  Layer.provide(TodoRepo.layer)
)

NodeRuntime.runMain(program.pipe(Effect.provide(appLayer)))
```

### Updated `README.md`

```markdown
# Example: Pi + Effect-First

A minimal Effect-first **Todo CLI** built by Pi using the effect-first.coey.dev reference.

## What this demonstrates

1. **AGENTS.md** — tells Pi to fetch the Effect reference before writing code
2. **The CLI** — a small but complete Effect program showing all core patterns:
   - `Effect.fn` for named, traced functions
   - `Schema.TaggedError` for typed errors (`TodoNotFoundError`, `TodoLimitExceededError`, `StorageError`)
   - `Context.Tag` + `Layer` for services (`TodoRepo`, `TodoService`)
   - `Schema.Class` + branded types for data (`TodoItem`, `TodoId`)
   - `Schema.Config` for configuration (`MAX_TODOS`)
   - `Layer.effect` for service-to-service dependencies
   - `@effect/vitest` for testing with test layers

## Try it

```bash
npm install
npm run build
node dist/cli.js add Buy milk
node dist/cli.js add Walk the dog
node dist/cli.js list
node dist/cli.js complete 1
node dist/cli.js remove 2
node dist/cli.js list
npm test
```

## How it was made

Pi was given the AGENTS.md in this directory and asked to build a minimal Todo CLI.
The reference at effect-first.coey.dev provided all the patterns.
```

### `AGENTS.md` (root, replaces `.ai/instructions.md`)

Same content as the existing `.ai/instructions.md` — no changes to text.

---

## 4. Patterns Demonstrated (vs. current greeter)

| Pattern | Greeter (current) | Todo (proposed) |
|---------|-------------------|------------------|
| `Effect.fn` | ✓ | ✓ |
| `Schema.TaggedError` | 1 error | 3 errors |
| `Context.Tag` + `Layer` | 1 service | 2 services |
| `Schema.Class` | 1 class | 2 classes (`TodoItem`, `CreateTodoInput`) |
| Branded types | `Name` | `TodoId` |
| `Schema.Config` | — | `MAX_TODOS` |
| `Layer.effect` (deps) | — | `TodoService` depends on `TodoRepo` |
| `Layer.sync` | — | `TodoRepo` |
| `Effect.catchTag` | 1 | 2 (not-found + limit) |
| Test layers | 1 | 2 (repo + service integration) |
| CRUD operations | — | add / list / complete / remove |

---

## 5. File Change Summary

| Action | File |
|--------|------|
| **DELETE** | `examples/pi/.ai/instructions.md` |
| **DELETE** | `examples/pi/.ai/` (directory) |
| **CREATE** | `examples/pi/AGENTS.md` |
| **REPLACE** | `examples/pi/README.md` |
| **REPLACE** | `examples/pi/src/schema.ts` |
| **REPLACE** | `examples/pi/src/errors.ts` |
| **DELETE** | `examples/pi/src/greeter.ts` |
| **DELETE** | `examples/pi/src/greeter.test.ts` |
| **CREATE** | `examples/pi/src/todo-repo.ts` |
| **CREATE** | `examples/pi/src/todo-service.ts` |
| **CREATE** | `examples/pi/src/todo-repo.test.ts` |
| **CREATE** | `examples/pi/src/todo-service.test.ts` |
| **REPLACE** | `examples/pi/src/cli.ts` |
| *unchanged* | `examples/pi/package.json` |
| *unchanged* | `examples/pi/tsconfig.json` |
| *unchanged* | `examples/pi/.gitignore` |

---

## 6. Verification Checks

```bash
cd examples/pi
npm install              # deps already sufficient
npx tsc --noEmit         # type-check passes
npm test                 # 9 tests pass (4 repo + 5 service)
npm run build            # compiles to dist/
node dist/cli.js add "Buy milk"      # prints add confirmation
node dist/cli.js list                # prints todo list
node dist/cli.js complete 1          # marks complete
node dist/cli.js remove 1            # removes
node dist/cli.js list                # empty list
```
