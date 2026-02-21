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

  /full        ~3500 tok  All sections combined (rules + reference + examples + anti-patterns).
                           Use: you have token budget and want everything in one fetch.

  /health      JSON       { "ok": true } — uptime check.

Tip: fetch /rules + /reference (~1400 tok) for most tasks. Add /examples only when generating new code.
`
