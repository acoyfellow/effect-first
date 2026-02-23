```ts
// main.ts
import { NodeRuntime } from "@effect/platform-node"
import { Effect, Schema } from "effect"

// Branded primitive
const UserId = Schema.String.pipe(Schema.brand("UserId"))
type UserId = typeof UserId.Type

// Schema.Class model
class User extends Schema.Class<User>("User")({
  id: UserId,
  name: Schema.String,
  email: Schema.String
}) {}

// A schema that decodes/encodes *JSON strings* for User
const UserJson = Schema.parseJson(User)

// Named, traced effectful function
const parseUserJson = Effect.fn("parseUserJson")((json: string) =>
  Schema.decodeUnknown(UserJson)(json)
)

const encodeUserJson = Effect.fn("encodeUserJson")((user: User) =>
  Schema.encode(UserJson)(user)
)

const program = Effect.gen(function* () {
  const input =
    '{"id":"user-123","name":"Alice","email":"alice@example.com"}'

  const user = yield* parseUserJson(input)

  // Log a field
  yield* Effect.logInfo(`Decoded user name: ${user.name}`)

  // Re-encode to JSON string
  const outputJson = yield* encodeUserJson(user)
  yield* Effect.logInfo(`Re-encoded JSON: ${outputJson}`)

  return outputJson
})

// Entry point
NodeRuntime.runMain(program)
```
