Below is a simple implementation of the requested Effect module in TypeScript, using the `Effect` library. This module includes services, schemas, errors, and configuration, all contained within a single file named `main.ts`.

```typescript
// main.ts
import * as Effect from '@effect-ts/core/Effect';
import * as Schema from '@effect-ts/schema';
import * as Config from '@effect-ts/core/Config';
import * as Console from '@effect-ts/core/Effect/Console';

// Define a tagged error for validation
const ValidationError = Schema.TaggedError<"ValidationError", string>();

// Define a branded type for the application name
type AppName = Schema.Branded<string, { readonly AppName: unique symbol }>;

const AppNameSchema = Schema.brand(Schema.string, (s): s is AppName => s.length > 0);

// Define a context tag for the application configuration
const AppConfig = Schema.Class<{
  appName: AppName;
}>();

// Define a service for greeting
const GreetingService = {
  greet: (name: string) => Effect.gen(function* (_) {
    if (name.trim().length === 0) {
      throw ValidationError("Name cannot be empty");
    }
    const greeting = `Hello, ${name}! Welcome to ${process.env.APP_NAME}`;
    yield* _(Console.log(greeting));
    return greeting;
  })
};

// Define the main application logic
const runApp = Effect.gen(function* (_) {
  const appName = yield* _(Config.get(AppConfig));
  const name = "John Doe"; // This could be replaced with user input

  yield* _(GreetingService.greet(name));
});

// Define the layer for the application configuration
const AppConfigLayer = Effect.succeed({
  appName: "My Awesome App" as AppName
});

// Entry point to run the application
const main = Effect.provideLayer(runApp)(AppConfigLayer);

// Handle tagged errors
const runMain = Effect.catchTag(main, {
  ValidationError: (error) => Console.log(`Validation Error: ${error}`)
});

// Execute the main function
Effect.runMain(runMain);
```

### Explanation:

1. **Error Handling**: We define a `ValidationError` using `Schema.TaggedError` to handle validation errors specifically.

2. **Branded Types**: We create a branded type `AppName` to ensure that the application name is a non-empty string.

3. **Context Tag**: We define a context tag `AppConfig` that holds the application configuration.

4. **Greeting Service**: The `GreetingService` provides a method `greet` that takes a name, validates it, and logs a greeting message.

5. **Main Logic**: The `runApp` function retrieves the application name from the configuration and calls the greeting service.

6. **Layer Definition**: The `AppConfigLayer` provides the application configuration needed by the application.

7. **Entry Point**: The `main` function combines the application logic with the configuration layer, and `runMain` handles any tagged errors that occur during execution.

8. **Execution**: Finally, we run the application using `Effect.runMain`.

This implementation meets the requirements specified in the task and demonstrates the use of the Effect library effectively.
