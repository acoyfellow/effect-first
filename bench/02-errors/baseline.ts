To create a small Effect program that validates an input string and prints a result, we will follow the requirements outlined in your task. Below is the complete implementation in a single file named `main.ts`.

```typescript
import { Effect, Schema, NodeRuntime } from 'effect-ts';

// Define a tagged error class for validation errors
class ValidationError extends Schema.TaggedError('ValidationError') {
  constructor(public message: string) {
    super(message);
  }
}

// Function to validate the input string
const validateInput = Effect.fn((input: string) => {
  if (input.length < 3) {
    return Effect.fail(new ValidationError('Input must be at least 3 characters long.'));
  }
  return Effect.succeed('Input is valid.');
});

// Main entry point
const main = Effect.gen(function* () {
  const input = process.argv[2]; // Get input from command line arguments

  // Validate the input and handle errors
  const result = yield* Effect.catchTag(
    validateInput(input),
    ValidationError,
    (error) => {
      console.error(`Error: ${error.message}`);
      return Effect.succeed(null); // Return null on error
    }
  );

  // Log success if the result is not null
  if (result !== null) {
    console.log(result);
  }
});

// Run the main effect
NodeRuntime.runMain(main);
```

### Explanation of the Code:

1. **ValidationError Class**: We define a custom error class `ValidationError` that extends `Schema.TaggedError`. This class will be used to represent validation errors.

2. **validateInput Function**: This function checks if the input string is shorter than 3 characters. If it is, it fails with a `ValidationError`. If the input is valid, it returns a success message.

3. **Main Function**: The `main` function is defined using `Effect.gen`, which allows us to sequence effects. It retrieves the input from command line arguments and calls the `validateInput` function. It uses `Effect.catchTag` to handle any `ValidationError` that may occur during validation.

4. **Logging**: If a validation error occurs, it logs the error message. If the input is valid, it logs the success message.

5. **NodeRuntime**: Finally, we use `NodeRuntime.runMain` to execute the `main` effect.

### Running the Program:
To run this program, save it in a file named `main.ts`, and then execute it using Node.js with the following command:

```bash
ts-node main.ts "your_input_string"
```

Replace `"your_input_string"` with the string you want to validate. If the string is shorter than 3 characters, it will log an error; otherwise, it will log a success message.
