import { createServer } from "node:http"
import { handler } from "./worker.js"

const readBody = async (request: AsyncIterable<Uint8Array>) => {
  const chunks: Array<Uint8Array> = []

  for await (const chunk of request) {
    chunks.push(chunk)
  }

  if (chunks.length === 0) {
    return undefined
  }

  const size = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0)
  const body = new Uint8Array(size)
  let offset = 0

  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }

  return body
}

const port = 3000

const server = createServer(async (req, res) => {
  const body =
    req.method === "GET" || req.method === "HEAD" ? undefined : await readBody(req)

  const init: RequestInit = {
    method: req.method ?? "GET",
    headers: req.headers as HeadersInit,
  }

  if (body) {
    init.body = body
  }

  const request = new Request(
    new URL(req.url ?? "/", `http://${req.headers.host ?? `localhost:${port}`}`),
    init
  )

  const response = await handler(request)

  res.statusCode = response.status

  response.headers.forEach((value, key) => {
    res.setHeader(key, value)
  })

  const buffer = Buffer.from(await response.arrayBuffer())
  res.end(buffer)
})

server.listen(port, () => {
  console.log(`effect-first research site listening on http://localhost:${port}`)
})
