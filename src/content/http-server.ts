export const HTTP_SERVER_TEXT = `# Effect-First TypeScript — HTTP Server (HttpApi)

Package: @effect/platform (HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup, HttpApiMiddleware, HttpApiSecurity)

## Imports

    import {
      HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup,
      HttpApiMiddleware, HttpApiSecurity
    } from "@effect/platform"

## Step 1 — Define endpoints

    import { HttpApiEndpoint, HttpApiGroup, HttpApi } from "@effect/platform"
    import { Schema } from "effect"

    class User extends Schema.Class<User>("User")({
      id: Schema.String,
      name: Schema.String,
    }) {}

    class UserNotFound extends Schema.TaggedError<UserNotFound>()("UserNotFound", {
      id: Schema.String,
    }) {}

    class UsersGroup extends HttpApiGroup.make("users")
      .add(
        HttpApiEndpoint.get("findById", "/users/:id")
          .setPath(Schema.Struct({ id: Schema.String }))
          .addSuccess(User)
          .addError(UserNotFound, { status: 404 })
      )
      .add(
        HttpApiEndpoint.post("create", "/users")
          .setPayload(Schema.Struct({ name: Schema.NonEmptyString }))
          .addSuccess(User, { status: 201 })
      )
      .prefix("/api") {}

    class MyApi extends HttpApi.make("myApi").add(UsersGroup) {}


## Step 2 — Implement handlers

    import { HttpApiBuilder } from "@effect/platform"
    import { Effect, Layer } from "effect"

    const UsersGroupLive = HttpApiBuilder.group(MyApi, "users", (handlers) =>
      handlers
        .handle("findById", ({ path }) =>
          Effect.gen(function* () {
            const users = yield* Users
            return yield* users.findById(path.id)
          })
        )
        .handle("create", ({ payload }) =>
          Effect.gen(function* () {
            const users = yield* Users
            return yield* users.create(payload.name)
          })
        )
    )


## Step 3 — Serve

    import { NodeHttpServer } from "@effect/platform-node"
    import { HttpApiBuilder } from "@effect/platform"
    import { Layer, Effect } from "effect"
    import { createServer } from "node:http"

    const ApiLive = HttpApiBuilder.api(MyApi).pipe(
      Layer.provide(UsersGroupLive),
      Layer.provide(Users.layer)
    )

    const ServerLive = NodeHttpServer.layer(createServer, { port: 3000 })

    const app = HttpApiBuilder.serve().pipe(
      Layer.provide(ServerLive),
      Layer.provide(ApiLive)
    )

    Layer.launch(app).pipe(Effect.runPromise)


## HttpApi key constructors

    HttpApi.make(id)                                — create API
    HttpApiGroup.make(id)                           — create group
    HttpApiEndpoint.get(name, path)                 — GET endpoint
    HttpApiEndpoint.post(name, path)                — POST endpoint
    HttpApiEndpoint.put(name, path)                 — PUT endpoint
    HttpApiEndpoint.del(name, path)                 — DELETE endpoint
    HttpApiEndpoint.patch(name, path)               — PATCH endpoint

## Endpoint schema methods (chainable)

    .setPath(Schema.Struct({ id: Schema.String }))  — path params
    .setPayload(schema)                              — request body (POST/PUT/PATCH)
    .setUrlParams(schema)                            — query string params (GET)
    .setHeaders(schema)                              — required headers
    .addSuccess(schema, { status: 200 })             — success response
    .addError(schema, { status: 404 })               — error response
    .prefix("/v1")                                   — path prefix

## Group / API composition

    group.add(endpoint)                              — add endpoint to group
    group.addError(schema, { status })               — shared error for all endpoints
    group.prefix("/api")                             — prefix all routes
    api.add(group)                                   — add group to api
    api.addError(schema, { status })                 — global error

## Builder

    HttpApiBuilder.api(MyApi)                        — Layer<HttpApi.Api>
    HttpApiBuilder.group(api, name, build)           — Layer for a group
    HttpApiBuilder.serve()                           — Layer that starts server
    HttpApiBuilder.toWebHandler(layer)               — { handler, dispose } for Cloudflare/Bun


## Security

    import { HttpApiSecurity, HttpApiMiddleware } from "@effect/platform"

    class AuthMiddleware extends HttpApiMiddleware.Tag<AuthMiddleware>()("AuthMiddleware", {
      provides: CurrentUser,
      security: { bearer: HttpApiSecurity.bearer },
    }) {}

    // Apply to group
    class SecureGroup extends HttpApiGroup.make("secure")
      .middleware(AuthMiddleware)
      .add(...) {}

    // Implement middleware
    const AuthMiddlewareLive = Layer.effect(AuthMiddleware, Effect.gen(function* () {
      return AuthMiddleware.of({
        bearer: (token) => Effect.gen(function* () {
          // validate token, return CurrentUser
        })
      })
    }))


## Anti-patterns

WRONG: Manual HttpRouter.get/post for typed APIs
RIGHT: HttpApi + HttpApiEndpoint for schema-validated, auto-documented endpoints

WRONG: Parsing request body manually in handlers
RIGHT: .setPayload(schema) — decoded and validated before handler runs

WRONG: Returning HttpServerResponse from handlers
RIGHT: Return domain types; framework encodes via success/error schemas

WRONG: Implementing auth checks inside each handler
RIGHT: HttpApiMiddleware + HttpApiSecurity applied to group or api
`
