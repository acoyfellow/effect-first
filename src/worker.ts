import { CURRENT_HOMEPAGE, EXPERIMENT_RESULTS, LEGACY_ARCHIVE } from "./generated-site-content.js"
import { toHtml } from "./html.js"
import { toLegacyHtml } from "./legacy-html.js"

const retiredRoutes = new Set([
  "/bootstrap.txt",
  "/adopt",
  "/evals",
  "/evals.json",
  "/rules",
  "/reference",
  "/examples",
  "/anti-patterns",
  "/http-server",
  "/http-client",
  "/sql",
  "/cli",
  "/streams",
  "/concurrency",
  "/resources",
  "/full",
  "/bundle",
])

const githubBase = "https://github.com/acoyfellow/effect-first/tree/main"
const githubBlobBase = "https://github.com/acoyfellow/effect-first/blob/main"
const bytesPerToken = 3.3
const legacyRouteTextByPath = LEGACY_ARCHIVE.routeTextByPath as Record<string, string>
const legacyModuleTextByName = LEGACY_ARCHIVE.moduleTextByName as Record<string, string>

const htmlResponse = (body: string) =>
  new Response(body, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  })

const textResponse = (body: string, status = 200) =>
  new Response(body, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  })

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  })

const estimateTokens = (text: string) => {
  const bytes = new TextEncoder().encode(text).length
  return Math.max(1, Math.ceil(bytes / bytesPerToken))
}

const legacyTextResponse = (request: Request, text: string, route: string, status = 200) => {
  const accept = request.headers.get("accept") ?? ""
  const wantJson = accept.includes("application/json") && !accept.includes("text/html")
  const wantHtml = accept.includes("text/html")
  const tokens = estimateTokens(text)

  if (wantJson) {
    return new Response(
      JSON.stringify(
        {
          ok: true,
          route: new URL(request.url).pathname,
          tokens,
          content: text,
        },
        null,
        2
      ),
      {
        status,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "public, max-age=3600",
          "X-Token-Count": String(tokens),
        },
      }
    )
  }

  const body = wantHtml ? toLegacyHtml(text, route) : text
  return new Response(body, {
    status,
    headers: {
      "content-type": wantHtml ? "text/html; charset=utf-8" : "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
      "X-Token-Count": String(tokens),
    },
  })
}

const validateLegacyVersion = (request: Request) => {
  const version = new URL(request.url).searchParams.get("version")
  if (!version) {
    return null
  }
  const normalized = version.trim()
  if (normalized === "latest" || normalized === "3") {
    return null
  }
  return normalized
}

const withLegacyVersionGuard = (request: Request, text: string, route: string) => {
  const invalid = validateLegacyVersion(request)
  if (invalid) {
    return legacyTextResponse(
      request,
      `Unsupported version "${invalid}". Use ?version=latest or ?version=3.`,
      route,
      400
    )
  }
  return legacyTextResponse(request, text, route)
}

const renderResearchAppendix = () => {
  const examples = [
    ["Shelley", `${githubBase}/examples/shelley`],
    ["Claude Code", `${githubBase}/examples/claude-code`],
    ["Cursor", `${githubBase}/examples/cursor`],
    ["Codex", `${githubBase}/examples/codex`],
    ["Copilot", `${githubBase}/examples/copilot`],
    ["Pi", `${githubBase}/examples/pi`],
  ] as const

  const exampleLinks = examples
    .map(([label, href]) => `<li><a href="${href}">${label}</a></li>`)
    .join("")

  const trialWins = EXPERIMENT_RESULTS.trialResults.filter(
    (trial) => trial.winner === "local-only"
  ).length

  return `<h2>Current status</h2>
<p><strong>Status:</strong> ${EXPERIMENT_RESULTS.status}. <strong>Current conclusion:</strong> ${EXPERIMENT_RESULTS.outcome}.</p>
<p>${EXPERIMENT_RESULTS.summary}</p>
<p><strong>What has been shown so far:</strong> the local-only arm won ${trialWins} out of ${EXPERIMENT_RESULTS.trials} internal trials on <code>${EXPERIMENT_RESULTS.taskId}</code>.</p>
<p><strong>What this does not show:</strong> it is still not broad or definitive proof of how Effect agents should be built in general.</p>
<h2>Read the evidence</h2>
<p><a href="${githubBlobBase}/experiment/PROTOCOL.md">Current protocol</a> · <a href="${githubBlobBase}/experiment/results.json">Raw result</a> · <a href="/old">Preserved historical site</a></p>
<h2>Example corpus</h2>
<p>The example projects remain the practical local context set for ongoing experiments.</p>
<ul>${exampleLinks}</ul>
<h2>Research goal</h2>
<p>The long-term goal is citable evidence about what guidance actually improves agent performance in Effect codebases. The current result is an early step toward that, not the final answer.</p>`
}

const renderRoot = () =>
  htmlResponse(
    toHtml("effect-first research", CURRENT_HOMEPAGE, {
      eyebrow: "effect-first research",
      lead:
        "This site is the active research front-end for a simple question: what guidance actually helps an agent write stronger Effect code, and what turns out to be noise?",
      actions: [
        { href: `${githubBlobBase}/experiment/results.json`, label: "Read current result" },
        { href: `${githubBlobBase}/experiment/PROTOCOL.md`, label: "Read current protocol" },
        { href: "/old", label: "View preserved historical site" },
        { href: `${githubBase}/examples/codex`, label: "Open codex example" },
      ],
      appendixHtml: renderResearchAppendix(),
    })
  )

const legacyModuleNames = new Set(Object.keys(legacyModuleTextByName))

const renderLegacy = (request: Request, path: string) => {
  if (path === "/health") {
    return jsonResponse({ ok: true })
  }

  if (path === "/bundle") {
    const invalid = validateLegacyVersion(request)
    if (invalid) {
      return legacyTextResponse(
        request,
        `Unsupported version "${invalid}". Use ?version=latest or ?version=3.`,
        path,
        400
      )
    }

    const modules = (new URL(request.url).searchParams.get("modules") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
    const parts = modules.flatMap((module) =>
      legacyModuleNames.has(module) ? [legacyModuleTextByName[module]] : []
    )
    if (parts.length === 0) {
      return legacyTextResponse(
        request,
        "Missing or invalid ?modules=. Valid modules: " +
          Object.keys(legacyModuleTextByName).join(", "),
        path,
        400
      )
    }
    return legacyTextResponse(request, parts.join("\n\n---\n\n"), path)
  }

  const text = legacyRouteTextByPath[path]
  if (text) {
    return withLegacyVersionGuard(request, text, path)
  }

  return textResponse("Not found. See /old for the preserved historical site.", 404)
}

export const handler = async (request: Request) => {
  const path = new URL(request.url).pathname

  if (path === "/health") {
    return jsonResponse({ ok: true })
  }

  if (path === "/") {
    return renderRoot()
  }

  if (path === "/old" || path.startsWith("/old/")) {
    const legacyPath = path === "/old" ? "/" : path.slice("/old".length)
    return renderLegacy(request, legacyPath)
  }

  if (retiredRoutes.has(path)) {
    return textResponse(
      "Gone. The historical site now lives under /old. See / for the active research homepage.",
      410
    )
  }

  return textResponse("Not found. See / for the active research homepage.", 404)
}

export default {
  fetch: handler,
}
