Here's a simple Effect program that prints a greeting to stdout using the specified Effect-First TypeScript rules. The program is contained in a single file named `main.ts`.

```typescript
import { Effect, NodeRuntime } from "effect";

const greet = Effect.fn("greet")(function* () {
  yield* Effect.logInfo("Hello, Effect!");
});

const program = Effect.gen(function* () {
  yield* greet;
});

NodeRuntime.runMain(program);
```

### Explanation:
1. **Effect.fn**: The `greet` function is wrapped with `Effect.fn` to define it as an effectful function.
2. **Effect.gen**: The `program` function uses `Effect.gen` to sequence the effects, yielding the `greet` effect.
3. **NodeRuntime.runMain**: The `program` is passed to `NodeRuntime.runMain` to execute it as the entry point.
4. **Effect.logInfo**: This is used to log the greeting message to stdout.

### Output:
When you run this program, it will output:
```
Hello, Effect!
```
