To create a small Effect program that defines schema-based types, encodes/decodes JSON, and meets the specified requirements, we can use the Effect library along with TypeScript. Below is a complete implementation in a single file named `main.ts`.

```typescript
// main.ts

import { Effect, Schema, NodeRuntime } from 'effect-ts';

// Define a branded type for UserId
const UserId = Schema.brand(Schema.string, 'UserId');

// Define the User schema
const UserSchema = Schema.struct({
  id: UserId,
  name: Schema.string,
  age: Schema.number,
});

// Function to parse JSON and log a field
const parseAndLogUser = Effect.gen(function* (_) {
  const jsonString = '{"id": "123", "name": "Alice", "age": 30}';

  // Decode the JSON string into a User
  const result = UserSchema.decode(JSON.parse(jsonString));

  // Check if decoding was successful
  if (result._tag === 'Right') {
    const user = result.right;
    console.log(`User Name: ${user.name}`); // Log the user's name

    // Re-encode the user back to JSON
    const encodedUser = UserSchema.encode(user);
    console.log('Encoded User JSON:', JSON.stringify(encodedUser));
  } else {
    console.error('Decoding failed:', result.left);
  }
});

// Entry point
const main = Effect.fn(() => parseAndLogUser);

// Run the main effect
NodeRuntime.runMain(main);
```

### Explanation:

1. **Branded Types**: We define a branded type `UserId` using `Schema.brand`, which helps in distinguishing the `id` field as a specific type.

2. **Schema Definition**: We define a `UserSchema` using `Schema.struct`, which describes the structure of a user object with `id`, `name`, and `age` fields.

3. **Effect.gen**: We use `Effect.gen` to create an effect that parses a JSON string, decodes it into a user object, logs the user's name, and re-encodes the user back to JSON.

4. **Error Handling**: We check if the decoding was successful by inspecting the `_tag` of the result. If it is a `Right`, we proceed; otherwise, we log an error.

5. **Entry Point**: We define the `main` function using `Effect.fn`, which serves as the entry point for our program.

6. **Running the Program**: Finally, we use `NodeRuntime.runMain` to execute the main effect.

### Running the Program

To run this program, ensure you have the Effect library installed in your TypeScript project. You can run the program using Node.js after compiling the TypeScript code.
