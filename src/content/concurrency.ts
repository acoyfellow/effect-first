export const CONCURRENCY_TEXT = `# Effect-First TypeScript — Concurrency

## Imports

    import { Effect, Fiber, FiberSet, FiberMap } from "effect"

## Structured concurrency

    // Run in parallel (all succeed or first error)
    const result = yield* Effect.all([taskA, taskB, taskC], { concurrency: 2 })

    // ForEach with concurrency + batching
    yield* Effect.forEach(items, (item) => process(item), { concurrency: 5 })

## Fork / join

    const fiber = yield* Effect.fork(task)
    const value = yield* Fiber.join(fiber)

    // Fork and interrupt
    const fiber = yield* Effect.fork(longRunning)
    yield* Fiber.interrupt(fiber)

    // Scoped fork (auto-interrupt on scope close)
    const fiber = yield* Effect.forkScoped(task)
    yield* Fiber.join(fiber)

## Race

    const fastest = yield* Effect.race(taskA, taskB)
    const winner = yield* Effect.raceAll([taskA, taskB, taskC])

## Fiber collections

    const set = yield* FiberSet.make()
    yield* FiberSet.run(set, taskA)
    yield* FiberSet.run(set, taskB)
    yield* FiberSet.join(set)

    const map = yield* FiberMap.make()
    yield* FiberMap.run(map, "job-1", taskA)
    yield* FiberMap.run(map, "job-2", taskB)
    yield* FiberMap.join(map, "job-1")

## Interrupt

    const fiber = yield* Effect.fork(task)
    yield* Fiber.interrupt(fiber)
    yield* Fiber.await(fiber)  // observe exit
`
