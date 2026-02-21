import { Effect, Schema } from "effect"
import { NodeRuntime } from "@effect/platform-node"

const UserId = Schema.String.pipe(Schema.brand("UserId"))
type UserId = typeof UserId.Type

class User extends Schema.Class<User>("User")({
  id: UserId,
  name: Schema.String,
}) {}

const decodeUser = Effect.fn("decodeUser")(function* (input: string) {
  const decoded = yield* Schema.decodeUnknown(User)(JSON.parse(input))
  return decoded
})

const program = Effect.gen(function* () {
  const raw = JSON.stringify({ id: "user-123", name: "Ada" })
  const user = yield* decodeUser(raw)
  yield* Effect.logInfo(`User ${user.name}`)
  const encoded = Schema.encode(User)(user)
  yield* Effect.logInfo(JSON.stringify(encoded))
})

NodeRuntime.runMain(program)
