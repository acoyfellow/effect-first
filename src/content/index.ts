export const INDEX_TEXT = `effect-first.coey.dev — plain-text Effect-TS reference for AI coding agents.

Endpoints (all text/plain unless noted):

  /rules       ~1000 tok  The 9 rules of Effect-first TypeScript. Terse, no examples.
                           Token counts are now served in X-Token-Count headers.
                           Use: you need the rules but already know the API surface.

  /reference   ~800 tok   Imports, primitives, type signatures, quick-lookup tables.
                           Use: you need a specific import path, type shape, or API name.

  /examples    ~2300 tok  Copy-paste ready code patterns (gen, Layer, Schema, etc.).
                           Use: you need concrete syntax to emit correct code.

  /anti-patterns ~650 tok "Never X -> do Y" correction table.
                           Use: you want to validate code or fix a known mistake.

  /http-server ~1700 tok  HttpApi declarative server: endpoints, groups, handlers, security.
                           Use: building an HTTP API with schema-validated routes.

  /http-client ~1100 tok  HttpClient service: GET/POST, schema decoding, HttpApiClient.
                           Use: making HTTP requests with typed errors and retry.

  /sql         ~1650 tok  @effect/sql: tagged template queries, SqlSchema, Model, SqlResolver.
                           Use: database access with validated queries and batching.

  /cli         ~1250 tok  Command execution + CLI argument parsing.
                           Use: running external processes or parsing env/argv config.

  /streams     ~1400 tok  Stream, Sink, Channel: creation, transforms, consumption.
                           Use: processing sequences of values with backpressure.

  /concurrency ~400 tok   Structured concurrency: Effect.all, forEach, fibers, race.
                           Use: parallel work, fork/join patterns, cancellations.

  /resources   ~400 tok   Resource lifecycle: Scope, acquireRelease, Layer.scoped, Pool.
                           Use: cleanup guarantees for connections, files, handles.

  /full        ~4000 tok  Core sections combined (rules + reference + examples + anti-patterns).
                           Use: you have token budget and want the core in one fetch.

  /bundle?modules=rules,reference  Combine modules in one response (comma-separated names).
                           Use: build a custom bundle in one fetch.

  /health      JSON       { "ok": true } — uptime check.

Tip: fetch /rules + /reference (~1800 tok) for most tasks. Add /examples only when generating new code.
For domain-specific work, add the relevant module endpoint (/http-server, /sql, etc.).
`
