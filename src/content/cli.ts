export const CLI_TEXT = `# Effect-First TypeScript — CLI & Commands

Effect provides two distinct capabilities:
1. Command execution — run external processes via @effect/platform Command
2. CLI argument parsing — use effect Config + Schema.Config for argv/env, or @effect/cli for full CLI apps

---

## Imports

    import { Command, CommandExecutor } from "@effect/platform"
    import { NodeCommandExecutor, NodeFileSystem } from "@effect/platform-node"
    import { Effect, Stream } from "effect"

---

## Running external commands

    const listFiles = Effect.gen(function* () {
      // Simple: get stdout as string
      const output = yield* Command.make("ls", "-la").pipe(Command.string)

      // With options
      const result = yield* Command.make("git", "status")
        .pipe(
          Command.workingDirectory("/path/to/repo"),
          Command.env({ GIT_AUTHOR_NAME: "bot" }),
          Command.string
        )

      // Exit code only
      const code = yield* Command.make("npm", "test").pipe(Command.exitCode)

      return output
    })

    // Provide the executor
    listFiles.pipe(
      Effect.provide(NodeCommandExecutor.layer),
      Effect.provide(NodeFileSystem.layer)
    )

---

## Streaming output

    // Stream stdout line by line
    const logStream = Command.make("tail", "-f", "/var/log/app.log").pipe(
      Command.streamLines
    )

    // Process as a stream
    const program = logStream.pipe(
      Stream.filter((line) => line.includes("ERROR")),
      Stream.tap((line) => Effect.logError(line)),
      Stream.runDrain
    )

    // Raw byte stream
    const bytes = Command.make("cat", "file.bin").pipe(Command.stream)

---

## Piping commands

    const pipeline = Command.make("cat", "data.csv").pipe(
      Command.pipeTo(Command.make("grep", "error")),
      Command.pipeTo(Command.make("wc", "-l")),
      Command.string
    )

---

## Process with stdin

    const withInput = Command.make("wc", "-w").pipe(
      Command.feed("hello world this is a test"),
      Command.string
    )

---

## Command API reference

    Command.make(cmd, ...args)           — create command
    Command.string(cmd)                  — run, return stdout as string
    Command.lines(cmd)                   — run, return stdout as string[]
    Command.exitCode(cmd)                — run, return exit code
    Command.stream(cmd)                  — stdout as Stream<Uint8Array>
    Command.streamLines(cmd)             — stdout as Stream<string>
    Command.start(cmd)                   — start Process (stdin/stdout/stderr access)
    Command.pipeTo(target)               — pipe stdout to another command
    Command.feed(input)                  — feed string to stdin
    Command.workingDirectory(path)       — set cwd
    Command.env(record)                  — set env vars
    Command.runInShell(shell)            — run via shell (boolean | string)

## Layers

    NodeCommandExecutor.layer            — Node.js process execution
    NodeFileSystem.layer                 — required by NodeCommandExecutor

---

## CLI argument parsing with Config

For simple CLIs, use effect’s Config module (reads from env + argv):

    import { Config, Effect, Schema } from "effect"

    const program = Effect.gen(function* () {
      const port = yield* Schema.Config("PORT", Schema.NumberFromString.pipe(
        Schema.int(), Schema.between(1, 65535)
      ))
      const verbose = yield* Config.withDefault(Config.boolean("VERBOSE"), false)
      const dbUrl = yield* Config.redacted("DATABASE_URL")
      yield* Effect.logInfo(\`Starting on port \${port}\`)
    })

---

## Anti-patterns

WRONG: child_process.exec(cmd, callback)
RIGHT: Command.make(cmd).pipe(Command.string)

WRONG: Manually parsing stdout string into lines
RIGHT: Command.streamLines(cmd) returns Stream<string>

WRONG: process.env.PORT with manual parseInt
RIGHT: Schema.Config("PORT", Schema.NumberFromString) with validation

WRONG: Forgetting to provide CommandExecutor layer
RIGHT: Effect.provide(NodeCommandExecutor.layer) + Effect.provide(NodeFileSystem.layer)
`
