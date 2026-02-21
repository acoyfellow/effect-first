Here's a complete TypeScript program that meets the requirements outlined in your task prompt. The program defines a schema-based model using `Schema.Class`, utilizes branded types, and implements the necessary functionality to parse a JSON string, log a field, and re-encode it. The entry point uses `NodeRuntime.runMain`.

```typescript
import { Effect, Schema, NodeRuntime } from "effect";

// Define a branded type for UserId
const UserId = Schema.String.pipe(Schema.brand("UserId"));
type UserId = typeof UserId.Type;

// Define a User schema class
class User extends Schema.Class<User>("User")({
  id: UserId,
  name: Schema.String,
  email: Schema.String,
  createdAt: Schema.Date,
}) {
  get displayName() {
    return `${this.name} (${this.email})`;
  }
}

// Function to parse JSON and log a field
const processUserJson = Effect.fn("processUserJson")(function* (jsonString: string) {
  // Decode from JSON string
  const userSchema = Schema.parseJson(User);
  const userResult = yield* Schema.decodeUnknown(userSchema)(jsonString);

  // Check for decoding errors
  if (userResult._tag === "Left") {
    yield* Effect.logError("Failed to decode user:", userResult.left);
    return;
  }

  const user = userResult.right;

  // Log the user's display name
  yield* Effect.logInfo(`User display name: ${user.displayName}`);

  // Encode back to JSON string
  const json = yield* Schema.encode(userSchema)(user);
  yield* Effect.logInfo(`Re-encoded JSON: ${json}`);
});

// Main program
const program = Effect.gen(function* () {
  const jsonString = JSON.stringify({
    id: UserId.make("u-1"),
    name: "Alice",
    email: "alice@example.com",
    createdAt: new Date().toISOString(),
  });

  yield* processUserJson(jsonString);
});

// Entry point
NodeRuntime.runMain(program);
```

### Explanation:
1. **Branded Type**: We define a branded type `UserId` using `Schema.brand`.
2. **Schema Class**: The `User` class is defined as a schema with fields for `id`, `name`, `email`, and `createdAt`.
3. **Effect.fn**: The `processUserJson` function is wrapped with `Effect.fn`, which handles the JSON parsing and logging.
4. **Effect.gen**: The main program uses `Effect.gen` to sequence the effects, including creating a sample JSON string and processing it.
5. **Entry Point**: The program is executed using `NodeRuntime.runMain`, which is the entry point for running the Effect program.

### Behavior:
- The program will parse the provided JSON string into a `User` object, log the user's display name, and then re-encode the `User` object back to a JSON string, logging the result.
