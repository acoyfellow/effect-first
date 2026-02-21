# Task 05: Full Stack Effect

Build a small Effect module that includes services, schemas, errors, and config.

Requirements:
- Use `Schema.TaggedError` for at least one error.
- Use `Schema.Class` and branded types.
- Define a `Context.Tag` service with a Layer.
- Use `Effect.fn` and `Effect.gen`.
- Provide layers at the entry point (`Effect.provide` + `NodeRuntime.runMain`).
- Keep everything in one file named `main.ts`.

Behavior:
- Load a config value (e.g., `APP_NAME`), build a greeting service, validate input, and log results.
- Use `Effect.catchTag` to handle tagged errors.
