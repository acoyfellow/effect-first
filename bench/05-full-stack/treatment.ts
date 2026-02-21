Here's a complete implementation of a small Effect module that meets the specified requirements. The module includes services, schemas, errors, and configuration, all contained within a single file named `main.ts`.

```typescript
// main.ts
import { Effect, Context, Layer, Schema, Config, Schedule } from "effect";

// Schema for a branded type
const AppName = Schema.String.pipe(Schema.brand("AppName"));
type AppName = typeof AppName.Type;

// Tagged error for invalid input
class InvalidInputError extends Schema.TaggedError<InvalidInputError>()(
  "InvalidInputError",
  { message: Schema.String }
) {}

// Context.Tag for the greeting service
class GreetingService extends Context.Tag("@app/GreetingService")<
  GreetingService,
  {
    readonly greet: (name: string) => Effect.Effect<unknown, InvalidInputError, string>;
  }
> {}

// Layer implementation for the greeting service
const GreetingServiceLayer = Layer.effect(GreetingService, Effect.gen(function* () {
  const greet = Effect.fn("greet")(function* (name: string) {
    if (!name || name.trim().length === 0) {
      return yield* Effect.fail(new InvalidInputError({ message: "Name cannot be empty." }));
    }
    return `Hello, ${name}!`;
  });

  return GreetingService.of({ greet });
}));

// Configuration for the application
class AppConfig extends Context.Tag("@app/AppConfig")<
  AppConfig,
  {
    readonly appName: AppName;
  }
> {
  static readonly layer = Layer.effect(AppConfig, Effect.gen(function* () {
    const appName = yield* Schema.Config("APP_NAME", AppName);
    return AppConfig.of({ appName });
  }));
}

// Main program
const program = Effect.gen(function* () {
  const config = yield* AppConfig;
  const greetingService = yield* GreetingService;

  const name = "Alice"; // This could be dynamic input
  const greeting = yield* greetingService.greet(name);

  yield* Effect.logInfo(`${config.appName}: ${greeting}`);
});

// Entry point
const main = Effect.gen(function* () {
  const configLayer = AppConfig.layer;
  const greetingLayer = GreetingServiceLayer;

  const appLayer = greetingLayer.pipe(Layer.provideMerge(configLayer));

  yield* program.pipe(
    Effect.provide(appLayer),
    Effect.catchTag("InvalidInputError", (e) => Effect.logError("Error: " + e.message))
  );
});

// Run the main program
Effect.runPromise(main);
```

### Explanation of the Code:

1. **Branded Type**: We define a branded type `AppName` using `Schema.String.pipe(Schema.brand("AppName"))`.

2. **Tagged Error**: The `InvalidInputError` class extends `Schema.TaggedError`, which is used to represent errors related to invalid input.

3. **Context.Tag Service**: The `GreetingService` class is defined as a service that provides a `greet` method.

4. **Layer Implementation**: The `GreetingServiceLayer` is implemented using `Layer.effect`, which provides the `greet` method. It checks if the input name is valid and returns an error if not.

5. **Configuration Layer**: The `AppConfig` class defines a configuration layer that retrieves the `APP_NAME` environment variable.

6. **Main Program**: The `program` function uses `Effect.gen` to sequence the effects, retrieving the configuration and greeting the user.

7. **Error Handling**: The `main` function includes error handling using `Effect.catchTag` to log any `InvalidInputError`.

8. **Entry Point**: The `main` function composes the layers and runs the program using `Effect.runPromise`.

This module encapsulates the required functionality and adheres to the Effect-First principles outlined in your prompt.
