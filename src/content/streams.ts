export const STREAMS_TEXT = `# Effect-First TypeScript — Streams

Stream<A, E, R> is a pull-based, backpressured sequence of values. Think of it as Effect that emits zero or more A values.

Package: effect (Stream, Sink, Channel)

## Imports

    import { Stream, Sink, Chunk, Effect, Schedule } from "effect"

## Creating streams

    // From values
    Stream.make(1, 2, 3)
    Stream.fromIterable([1, 2, 3])
    Stream.range(1, 100)
    Stream.empty

    // From Effect (single value stream)
    Stream.fromEffect(fetchUser(id))

    // Repeated effect
    Stream.repeatEffect(readSensor)
    Stream.repeatEffectWithSchedule(pollApi, Schedule.spaced("5 seconds"))

    // Pagination
    Stream.paginate(initialCursor, (cursor) => {
      const page = fetchPage(cursor)
      return [page.items, Option.fromNullable(page.nextCursor)]
    })

    // From async
    Stream.fromAsyncIterable(asyncIter, (e) => new MyError({ cause: e }))
    Stream.async((emit) => { /* push values via emit */ })

    // Infinite
    Stream.iterate(0, (n) => n + 1)
    Stream.repeatValue("tick")


## Transforming streams

    stream.pipe(
      Stream.map((x) => x * 2),
      Stream.filter((x) => x > 10),
      Stream.take(5),
      Stream.drop(2),
      Stream.flatMap((x) => Stream.make(x, x + 1)),
      Stream.mapEffect((x) => processItem(x)),
      Stream.tap((x) => Effect.logInfo(\`Processing: \${x}\`)),
      Stream.scan(0, (acc, x) => acc + x),
    )

    // Chunked operations (batch-efficient)
    stream.pipe(
      Stream.mapChunks((chunk) => Chunk.map(chunk, transform)),
      Stream.grouped(100),           // group into chunks of 100
      Stream.debounce("500 millis"), // debounce emissions
    )


## Consuming streams

    // Collect all (careful with large streams)
    const items = yield* Stream.runCollect(stream)  // Chunk<A>

    // Fold
    const sum = yield* Stream.runFold(stream, 0, (acc, x) => acc + x)

    // ForEach (side effects)
    yield* Stream.runForEach(stream, (item) => processItem(item))

    // Drain (discard values, run for effects)
    yield* Stream.runDrain(stream)

    // Count
    const n = yield* Stream.runCount(stream)

    // With Sink
    yield* Stream.run(stream, Sink.collectAll())
    yield* Stream.run(stream, Sink.foldLeft(0, (acc, x) => acc + x))


## Combining streams

    // Merge (interleave, concurrent)
    Stream.merge(streamA, streamB)
    Stream.mergeAll([streamA, streamB, streamC], { concurrency: 3 })

    // Concat (sequential)
    Stream.concat(streamA, streamB)

    // Zip (pair elements)
    Stream.zip(streamA, streamB)          // Stream<[A, B]>
    Stream.zipWith(streamA, streamB, (a, b) => a + b)


## Error handling

    stream.pipe(
      Stream.catchAll((e) => Stream.make(fallbackValue)),
      Stream.catchTag("NetworkError", (e) => Stream.empty),
      Stream.retry(Schedule.exponential("1 second")),
    )


## Sinks (stream consumers)

    Sink.collectAll()                    — collect into Chunk<A>
    Sink.foldLeft(init, f)               — fold without early termination
    Sink.fold(init, contFn, f)           — fold with early termination
    Sink.forEach(f)                      — side-effect per element
    Sink.head                            — first element as Option<A>
    Sink.last                            — last element as Option<A>
    Sink.count                           — count elements
    Sink.sum                             — sum numbers
    Sink.take(n)                         — take first n into Chunk<A>


## Common patterns

    // Polling with schedule
    const poller = Stream.repeatEffectWithSchedule(
      checkStatus,
      Schedule.spaced("10 seconds")
    ).pipe(
      Stream.takeUntil((status) => status === "complete")
    )

    // Batched processing
    const batchProcessor = eventStream.pipe(
      Stream.grouped(50),
      Stream.mapEffect((batch) => processBatch(Chunk.toReadonlyArray(batch)),
        { concurrency: 3 }
      ),
      Stream.runDrain
    )


## Anti-patterns

WRONG: Collecting unbounded stream into array
RIGHT: Stream.runForEach or Stream.runFold for bounded consumption

WRONG: for await (const x of asyncIter) with manual error handling
RIGHT: Stream.fromAsyncIterable + Stream.mapEffect for typed errors

WRONG: setInterval + mutable array for polling
RIGHT: Stream.repeatEffectWithSchedule + Stream.takeUntil

WRONG: Manual batching with counters
RIGHT: Stream.grouped(n) + Stream.mapEffect with concurrency

WRONG: Promise.all for concurrent stream processing
RIGHT: Stream.mergeAll with concurrency option
`
