Here's a complete implementation of the task requirements in a single file named `main.ts`. This program defines a schema-based model using `Schema.Class`, utilizes branded types, and demonstrates encoding and decoding JSON using `Effect` from the `@effect` library.

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

// Define a function to parse JSON and log a field
const processUserJson = Effect.fn("processUserJson")(function* (jsonString: string) {
  // Decode from JSON string
  const parsedUser = yield* Schema.decodeUnknown(User)(jsonString);
  
  // Log the user's display name
  yield* Effect.logInfo(`User Display Name: ${parsedUser.displayName}`);

  // Encode back to JSON string
  const json = yield* Schema.encode(User)(parsedUser);
  return json;
});

// Main program
const main = Effect.gen(function* () {
  const jsonString = JSON.stringify({
    id: UserId.make("u-1"),
    name: "Alice",
    email: "alice@example.com",
    createdAt: new Date().toISOString(),
  });

  const resultJson = yield* processUserJson(jsonString);
  yield* Effect.logInfo(`Re-encoded JSON: ${resultJson}`);
});

// Entry point
NodeRuntime.runMain(main);
```

### Explanation:
1. **Branded Type**: We create a branded type `UserId` using `Schema.brand`.
2. **Schema Class**: The `User` class is defined using `Schema.Class`, which includes fields for `id`, `name`, `email`, and `createdAt`.
3. **Effect.fn**: The `processUserJson` function is defined using `Effect.fn`, which takes a JSON string, decodes it into a `User` instance, logs the display name, and then re-encodes it back to a JSON string.
4. **Main Program**: The `main` function generates a JSON string representing a user, processes it through `processUserJson`, and logs the re-encoded JSON.
5. **Entry Point**: The program is executed using `NodeRuntime.runMain`.

### Usage:
To run this program, ensure you have the `@effect` library installed and execute it in a Node.js environment. The program will log the user's display name and the re-encoded JSON string to the console.
