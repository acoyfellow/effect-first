Here's a complete implementation of a small Effect module that meets the requirements specified in your task prompt. The module includes services, schemas, errors, and configuration, all contained within a single file named `main.ts`.

```typescript
// main.ts
import { Effect, Context, Layer, Schema, Config, Redacted, Schedule, Match } from "effect";

// Define a branded type for the AppName
const AppName = Schema.String.pipe(Schema.brand("AppName"));
type AppName = typeof AppName.Type;

// Define a tagged error for invalid input
class InvalidInputError extends Schema.TaggedError<InvalidInputError>()(
  "InvalidInputError",
  { message: Schema.String }
) {}

// Define a schema for the greeting request
class GreetingRequest extends Schema.Class<GreetingRequest>("GreetingRequest")({
  name: Schema.String,
}) {}

// Define a service for the greeting functionality
class GreetingService extends Context.Tag("@app/GreetingService")<
  GreetingService,
  {
    readonly greet: (request: GreetingRequest) => Effect.Effect<string, InvalidInputError>;
  }
> {
  static readonly layer = Layer.effect(
    GreetingService,
    Effect.gen(function* () {
      const greet = Effect.fn("greet")(function* (request: GreetingRequest) {
        if (!request.name || request.name.trim() === "") {
          return yield* Effect.fail(new InvalidInputError({ message: "Name cannot be empty." }));
        }
        return `Hello, ${request.name}! Welcome to ${yield* AppConfig.getAppName()}.`;
      });

      return GreetingService.of({ greet });
    })
  );
}

// Define a service for application configuration
class AppConfig extends Context.Tag("@app/AppConfig")<
  AppConfig,
  {
    readonly appName: AppName;
  }
> {
  static readonly layer = Layer.effect(
    AppConfig,
    Effect.gen(function* () {
      const appName = yield* Schema.Config("APP_NAME", AppName);
      return AppConfig.of({ appName });
    })
  );

  static getAppName() {
    return Effect.access((config: AppConfig) => config.appName);
  }
}

// Main program to run the greeting service
const program = Effect.gen(function* () {
  const greetingService = yield* GreetingService;
  const request = new GreetingRequest({ name: "Alice" });

  const greeting = yield* greetingService.greet(request).pipe(
    Effect.catchTag("InvalidInputError", (error) => Effect.succeed(`Error: ${error.message}`))
  );

  yield* Effect.logInfo(greeting);
});

// Entry point to provide layers and run the program
const main = Effect.gen(function* () {
  const configLayer = AppConfig.layer;
  const greetingLayer = GreetingService.layer;

  const appLayer = greetingLayer.pipe(Layer.provideMerge(configLayer));

  yield* Effect.runPromise(program.pipe(Effect.provide(appLayer)));
});

// Run the main effect
Effect.runMain(main);
```

### Explanation of the Code:

1. **Branded Type**: We define a branded type `AppName` for the application name using `Schema.String.pipe(Schema.brand("AppName"))`.

2. **Tagged Error**: The `InvalidInputError` class extends `Schema.TaggedError` to handle cases where the input is invalid.

3. **Schema Class**: The `GreetingRequest` class is defined using `Schema.Class` to represent the input for the greeting service.

4. **Service Definition**: The `GreetingService` class is defined as a `Context.Tag` with a method `greet` that takes a `GreetingRequest` and returns a greeting message or an error.

5. **Configuration Service**: The `AppConfig` class is defined to load the application name from the environment variable `APP_NAME`.

6. **Main Program**: The `program` function uses `Effect.gen` to sequence the effects, calling the `greet` method and handling the `InvalidInputError` using `Effect.catchTag`.

7. **Entry Point**: The `main` function composes the layers and provides them to the program, which is then executed using `Effect.runMain`.

### Usage:
To run this code, ensure you have the necessary environment variable `APP_NAME` set, and then execute the TypeScript file using a TypeScript runtime that supports the Effect library.
