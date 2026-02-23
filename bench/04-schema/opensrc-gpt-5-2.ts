```ts
// main.ts
import { Effect, Schema, ParseResult } from "effect"
import { NodeRuntime } from "@effect/platform-node"

// -----------------------------
// Branded types
// -----------------------------
type UserIdBrand = "UserId"
const UserId = Schema.String.pipe(
  Schema.minLength(1),
  Schema.brand<UserIdBrand>()
)

type EmailBrand = "Email"
const Email = Schema.String.pipe(
  Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  Schema.brand<EmailBrand>()
)

// -----------------------------
// Schema.Class model
// -----------------------------
class User extends Schema.Class<User>("User")({
  id: UserId,
  email: Email,
  name: Schema.String,
  age: Schema.Number.pipe(Schema.int(), Schema.nonNegative())
}) {}

// Decoders / encoders for JSON
const decodeUserJson = ParseResult.decodeUnknownPromise(User)
const encodeUserJson = ParseResult.encodeUnknownPromise(User)

// -----------------------------
// Named Effect functions (Effect.fn)
// -----------------------------
const parseUser = Effect.fn("parseUser")((
  json: string
) =>
  Effect.tryPromise({
    try: async () => decodeUserJson(JSON.parse(json)),
    catch: (cause) => cause
  })
)

const reEncodeUser = Effect.fn("reEncodeUser")((
  user: User
) =>
  Effect.tryPromise({
    try: async () => JSON.stringify(await encodeUserJson(user)),
    catch: (cause) => cause
  })
)

// -----------------------------
// Program (Effect.gen sequencing)
// -----------------------------
const program = Effect.gen(function* () {
  const input =
    `{"id":"u_123","email":"ada@example.com","name":"Ada","age":36}`

  const user = yield* parseUser(input)

  // Log a field
  yield* Effect.log(`User email: ${user.email}`)

  // Re-encode
  const outputJson = yield* reEncodeUser(user)
  yield* Effect.log(`Re-encoded JSON: ${outputJson}`)
})

// -----------------------------
// Entry point
// -----------------------------
NodeRuntime.runMain(program)
```
