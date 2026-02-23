```ts
// main.ts
import { Effect, Schema } from "effect"
import { NodeRuntime } from "@effect/platform-node"

// --- Branded domain primitives ---
const UserId = Schema.String.pipe(Schema.minLength(1), Schema.brand("UserId"))
type UserId = typeof UserId.Type

const Email = Schema.String.pipe(Schema.pattern(/.+@.+\..+/), Schema.brand("Email"))
type Email = typeof Email.Type

// --- Schema.Class model ---
class User extends Schema.Class<User>("User")({
  id: UserId,
  name: Schema.String.pipe(Schema.minLength(1)),
  email: Email,
  createdAt: Schema.Date
}) {}

// JSON <-> User (string codec)
const UserJson = Schema.parseJson(User)

// --- Named effectful functions (Effect.fn) ---
const decodeUserJson = Effect.fn("decodeUserJson")(function* (json: string) {
  return yield* Schema.decodeUnknown(UserJson)(json)
})

const encodeUserJson = Effect.fn("encodeUserJson")(function* (user: User) {
  return yield* Schema.encode(UserJson)(user)
})

// --- Program (Effect.gen sequencing) ---
const program = Effect.gen(function* () {
  const inputJson = JSON.stringify({
    id: "user_123",
    name: "Ada Lovelace",
    email: "ada@example.com",
    createdAt: "2024-01-02T03:04:05.000Z"
  })

  const user = yield* decodeUserJson(inputJson)

  yield* Effect.logInfo(`User email: ${user.email}`)

  const outputJson = yield* encodeUserJson(user)

  yield* Effect.logInfo(`Re-encoded JSON: ${outputJson}`)
})

// --- Entry point ---
NodeRuntime.runMain(program)
```
