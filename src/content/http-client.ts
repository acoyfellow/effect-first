export const HTTP_CLIENT_TEXT = `# Effect-First TypeScript — HTTP Client

Package: @effect/platform (HttpClient, HttpClientRequest, HttpClientResponse, HttpClientError)

## Imports

    import { HttpClient, HttpClientRequest, HttpClientResponse, FetchHttpClient } from "@effect/platform"
    import { NodeHttpClient } from "@effect/platform-node"
    import { Effect, Schema } from "effect"

## Basic GET

    const fetchUser = Effect.fn("fetchUser")(function* (id: string) {
      const client = yield* HttpClient.HttpClient
      const response = yield* client.get(\`https://api.example.com/users/\${id}\`)
      return yield* HttpClientResponse.schemaBodyJson(User)(response)
    })

    // Provide the client layer
    fetchUser("u-1").pipe(Effect.provide(FetchHttpClient.layer))

## POST with JSON body

    const createUser = Effect.fn("createUser")(function* (name: string) {
      const client = yield* HttpClient.HttpClient
      const request = HttpClientRequest.post("https://api.example.com/users").pipe(
        HttpClientRequest.jsonBody({ name })
      )
      const response = yield* client.execute(request)
      return yield* HttpClientResponse.schemaBodyJson(User)(response)
    })

## HttpApiClient — typed client from HttpApi definition

    import { HttpApiClient } from "@effect/platform"

    const program = Effect.gen(function* () {
      const client = yield* HttpApiClient.make(MyApi, {
        baseUrl: "https://api.example.com",
      })
      const user = yield* client.users.findById({ path: { id: "u-1" } })
    })

## Resilience — retry + timeout

    const resilientFetch = fetchUser("u-1").pipe(
      Effect.retry(Schedule.exponential("200 millis").pipe(Schedule.compose(Schedule.recurs(3)))),
      Effect.timeout("10 seconds"),
      Effect.withSpan("fetchUser")
    )

---

## Key types

    HttpClient.HttpClient                — Context.Tag for the client service
    HttpClientRequest.HttpClientRequest  — immutable request description
    HttpClientResponse.HttpClientResponse — response with schema decoding
    HttpClientError.HttpClientError      — typed error (RequestError | ResponseError)

## Client methods

    client.get(url, options?)            — GET request
    client.post(url, options?)           — POST request
    client.put(url, options?)            — PUT request
    client.del(url, options?)            — DELETE request
    client.patch(url, options?)          — PATCH request
    client.head(url, options?)           — HEAD request
    client.execute(request)              — execute arbitrary request

## Response decoding

    HttpClientResponse.schemaBodyJson(schema)(response)   — decode JSON body
    HttpClientResponse.text(response)                     — body as string
    HttpClientResponse.json(response)                     — body as unknown JSON
    HttpClientResponse.stream(response)                   — body as Stream<Uint8Array>

## Layers

    FetchHttpClient.layer                — uses globalThis.fetch (browser, Cloudflare Workers, Bun)
    NodeHttpClient.layer                 — uses Node.js undici

## Anti-patterns

WRONG: fetch(url).then(r => r.json())
RIGHT: client.get(url) |> HttpClientResponse.schemaBodyJson(Schema)

WRONG: Manual error handling for HTTP status codes
RIGHT: HttpClient errors are typed; use Effect.catchTag("ResponseError", ...)

WRONG: Hardcoding fetch in service implementations
RIGHT: Depend on HttpClient.HttpClient tag; provide FetchHttpClient.layer or NodeHttpClient.layer

WRONG: Building typed API clients by hand
RIGHT: HttpApiClient.make(MyApi) generates fully typed client from HttpApi definition
`
