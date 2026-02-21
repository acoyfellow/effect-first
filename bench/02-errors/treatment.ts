Here's a complete TypeScript program that meets the requirements specified in your task prompt. This program validates an input string, defines a tagged error for validation failures, and uses the Effect library to manage effects and error handling.

```typescript
import { Effect, Schema, NodeRuntime } from "effect";

// Define a tagged error for validation failure
class ValidationError extends Schema.TaggedError<ValidationError>()(
  "ValidationError",
  { message: Schema.String }
) {}

// Define a function to validate the input string
const validateInput = Effect.fn("validateInput")(function* (input: string) {
  if (input.length < 3) {
    // If the input is shorter than 3 characters, throw a ValidationError
    throw new ValidationError({ message: "Input must be at least 3 characters long." });
  }
  return input; // Return the valid input
});

// Define the main program using Effect.gen for sequencing
const program = Effect.gen(function* () {
  const input = "ab"; // Example input string

  // Validate the input and handle potential validation errors
  const result = yield* validateInput(input).pipe(
    Effect.catchTag("ValidationError", (error) => {
      // Log the error message if validation fails
      return Effect.logError("Validation Error:", error.message);
    })
  );

  // Log success if validation passes
  yield* Effect.logInfo(`Validation succeeded: ${result}`);
});

// Entry point using NodeRuntime.runMain
NodeRuntime.runMain(program);
```

### Explanation:
1. **Tagged Error**: The `ValidationError` class is defined using `Schema.TaggedError`, which will be thrown when the input validation fails.
2. **Effect.fn**: The `validateInput` function is wrapped with `Effect.fn`, making it a named effectful function that validates the input string.
3. **Effect.gen**: The main program is defined using `Effect.gen`, allowing for sequencing of effects.
4. **Error Handling**: The program uses `Effect.catchTag` to catch the `ValidationError` and log the error message if validation fails.
5. **Logging**: The program logs either the error or a success message based on the validation result.
6. **Entry Point**: The program is executed using `NodeRuntime.runMain`, which is the entry point for running the Effect program.

### Behavior:
- If the input string is shorter than 3 characters, it logs an error message.
- If the input string is valid (3 characters or longer), it logs a success message. 

You can run this code in a TypeScript environment with the Effect library installed to see the behavior in action. Adjust the `input` variable to test different scenarios.
