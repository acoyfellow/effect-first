To create a simple Effect program that prints a greeting to stdout, you can follow the structure outlined in your requirements. Below is a complete implementation in TypeScript, using the Effect library.

```typescript
// main.ts

import { Effect, NodeRuntime } from 'effect-ts';

const greet = Effect.fn(() => {
  console.log("Hello, Effect!");
});

const main = Effect.gen(function* () {
  yield* greet();
});

NodeRuntime.runMain(main);
```

### Explanation:
1. **Imports**: We import the necessary modules from the `effect-ts` library.
2. **greet Function**: We define a function `greet` using `Effect.fn` that prints "Hello, Effect!" to the console.
3. **Main Effect**: We define the main effect using `Effect.gen`, which allows us to sequence effects. In this case, we yield the `greet` effect.
4. **Entry Point**: Finally, we use `NodeRuntime.runMain` to execute the main effect.

### Running the Program:
To run this program, ensure you have the `effect-ts` library installed in your project. You can run the program using Node.js, and it will output:

```
Hello, Effect!
``` 

Make sure to save the code in a file named `main.ts` as specified.
