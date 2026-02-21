Here's a simple Effect program that prints a greeting to stdout, following the specified requirements. The program uses `Effect.fn` for the named function and `Effect.gen` for sequencing. The entry point is provided using `NodeRuntime.runMain`.

```typescript
import { Effect, NodeRuntime } from "effect";

const greet = Effect.fn("greet")(function* () {
  return "Hello, Effect!";
});

const program = Effect.gen(function* () {
  const message = yield* greet;
  yield* Effect.logInfo(message);
});

NodeRuntime.runMain(program);
```

### Explanation:
1. **Effect.fn**: The `greet` function is defined using `Effect.fn`, which returns a greeting message.
2. **Effect.gen**: The `program` function is defined using `Effect.gen`, where we yield the result of the `greet` function and log it to stdout.
3. **NodeRuntime.runMain**: This is used to run the `program` as the entry point of the application.

### Output:
When you run this program, it will output:
```
Hello, Effect!
```
