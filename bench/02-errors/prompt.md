# Task 02: Tagged Errors

Build a small Effect program that validates an input string and prints a result.

Requirements:
- Define at least one `Schema.TaggedError` error class.
- Use `Effect.fn` for named functions.
- Use `Effect.gen` for sequencing.
- Handle errors with `Effect.catchTag`.
- Entry point uses `NodeRuntime.runMain`.
- Keep everything in one file named `main.ts`.

Behavior:
- If the input is shorter than 3 chars, log an error.
- Otherwise, log success.
