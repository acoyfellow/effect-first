To create a simple Effect program that prints a greeting to stdout, you can follow the structure below. This program uses `Effect.fn` for defining functions and `Effect.gen` for sequencing. The entry point is provided by `NodeRuntime.runMain`.

Here is the complete code for `main.ts`:

```typescript
import { Effect, NodeRuntime } from 'effect-ts';

const greet = Effect.fn(() => {
  console.log('Hello, Effect!');
});

const main = Effect.gen(function* () {
  yield* greet();
});

NodeRuntime.runMain(main);
```

### Explanation:
1. **Imports**: We import the necessary modules from `effect-ts`.
2. **greet Function**: We define a function `greet` using `Effect.fn` that prints "Hello, Effect!" to the console.
3. **Main Effect**: We create a main effect using `Effect.gen`, which allows us to sequence effects. Inside this main effect, we yield the `greet` effect.
4. **Entry Point**: Finally, we use `NodeRuntime.runMain` to run the main effect.

### Running the Program:
To run this program, ensure you have the `effect-ts` library installed in your project. You can then execute the script using Node.js. The output will be:

```
Hello, Effect!
```
