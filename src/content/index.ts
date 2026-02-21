export const INDEX_TEXT = `effect-first.coey.dev — plain-text Effect-TS reference for AI coding agents.

Endpoints (all text/plain unless noted):

  /rules       ~800 tok   The 9 rules of Effect-first TypeScript. Terse, no examples.
                           Use: you need the rules but already know the API surface.

  /reference   ~600 tok   Imports, primitives, type signatures, quick-lookup tables.
                           Use: you need a specific import path, type shape, or API name.

  /examples    ~2000 tok  Copy-paste ready code patterns (gen, Layer, Schema, etc.).
                           Use: you need concrete syntax to emit correct code.

  /anti-patterns ~400 tok "Never X -> do Y" correction table.
                           Use: you want to validate code or fix a known mistake.

  /http-server ~1200 tok  HttpApi declarative server: endpoints, groups, handlers, security.
                           Use: building an HTTP API with schema-validated routes.

  /http-client ~800 tok   HttpClient service: GET/POST, schema decoding, HttpApiClient.
                           Use: making HTTP requests with typed errors and retry.

  /sql         ~1200 tok  @effect/sql: tagged template queries, SqlSchema, Model, SqlResolver.
                           Use: database access with validated queries and batching.

  /cli         ~900 tok   Command execution + CLI argument parsing.
                           Use: running external processes or parsing env/argv config.

  /streams     ~1100 tok  Stream, Sink, Channel: creation, transforms, consumption.
                           Use: processing sequences of values with backpressure.

  /full        ~3500 tok  Core sections combined (rules + reference + examples + anti-patterns).
                           Use: you have token budget and want the core in one fetch.

  /bundle?modules=rules,reference  Combine modules in one response (comma-separated names).
                           Use: build a custom bundle in one fetch.

  /health      JSON       { "ok": true } — uptime check.

Tip: fetch /rules + /reference (~1400 tok) for most tasks. Add /examples only when generating new code.
For domain-specific work, add the relevant module endpoint (/http-server, /sql, etc.).
`
