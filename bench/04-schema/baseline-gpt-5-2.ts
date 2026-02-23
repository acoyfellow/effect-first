```ts
// main.ts
import { Effect } from "effect"
import { Schema } from "@effect/schema"
import { NodeRuntime } from "@effect/platform-node"

// --- Branded types -----------------------------------------------------------

type UserId = string & { readonly UserId: unique symbol }

const UserId = Schema.String.pipe(
  Schema.minLength(1),
  Schema.brand<UserId>("UserId")
)

// --- Schema.Class model ------------------------------------------------------

class User extends Schema.Class<User>("User")({
  id: UserId,
  name: Schema.String,
  age: Schema.Number
}) {}

// --- Program ----------------------------------------------------------------

const program = Effect.gen(function* () {
  const json = `{"id":"u_123","name":"Ada","age":37}`

  // decode JSON -> User
  const user = yield* Schema.decodeUnknown(User)(JSON.parse(json))

  // log a field
  yield* Effect.log(`User name: ${user.name}`)

  // encode User -> JSON-compatible value, then stringify
  const encoded = yield* Schema.encode(User)(user)
  const reJson = JSON.stringify(encoded)

  yield* Effect.log(`Re-encoded JSON: ${reJson}`)
})

// Named entry function using Effect.fn
const main = Effect.fn("main")(() => program)

// Entry point
NodeRuntime.runMain(main())
```
