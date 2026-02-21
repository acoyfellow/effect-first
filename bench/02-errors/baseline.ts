To create a small Effect program in TypeScript that validates an input string and handles errors using `Schema.TaggedError`, we can follow the requirements you've provided. Below is a complete implementation in a single file named `main.ts`.

```typescript
import { Effect, Schema } from 'effect';
import { NodeRuntime } from 'effect/node';

// Define a tagged error class for validation errors
class InputValidationError extends Schema.TaggedError<"InputValidationError"> {
  constructor(message: string) {
    super("InputValidationError", message);
  }
}

// Function to validate the input string
const validateInput = Effect.fn((input: string) => {
  if (input.length < 3) {
    throw new InputValidationError("Input must be at least 3 characters long.");
  }
  return "Input is valid.";
});

// Main function to run the program
const main = Effect.gen(function* () {
  const input = process.argv[2]; // Get input from command line arguments

  // Validate the input and handle errors
  const result = yield* Effect.tryCatch(
    () => validateInput(input),
    (error) => {
      if (error instanceof InputValidationError) {
        console.error(error.message);
      } else {
        console.error("An unexpected error occurred.");
      }
      return Effect.fail(error);
    }
  );

  // Log success if validation passes
  console.log(result);
});

// Entry point to run the main function
NodeRuntime.runMain(main);
```

### Explanation:
1. **InputValidationError Class**: This class extends `Schema.TaggedError` and is used to represent validation errors specifically related to input length.

2. **validateInput Function**: This function checks if the input string is shorter than 3 characters. If it is, it throws an `InputValidationError`. If the input is valid, it returns a success message.

3. **Main Function**: The main function retrieves the input from command line arguments and attempts to validate it. It uses `Effect.tryCatch` to handle any errors that may arise during validation. If an `InputValidationError` is caught, it logs the error message; otherwise, it logs a generic error message.

4. **NodeRuntime.runMain**: This is the entry point of the program, which runs the main function.

### Usage:
To run this program, save it as `main.ts`, and then use the following command in your terminal:

```bash
ts-node main.ts "your_input_string"
```

Replace `"your_input_string"` with the string you want to validate. If the string is shorter than 3 characters, it will log an error message; otherwise, it will log a success message.
