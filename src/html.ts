const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

const CSS = `
*{box-sizing:border-box}
body{margin:0;padding:2rem;font:15px/1.7 -apple-system,system-ui,sans-serif;background:#0d1117;color:#c9d1d9;max-width:900px;margin:0 auto}
a{color:#58a6ff;text-decoration:none}a:hover{text-decoration:underline}
h1{font-size:1.6rem;color:#f0f6fc;border-bottom:1px solid #21262d;padding-bottom:.5rem;margin-top:2rem}
h2{font-size:1.2rem;color:#e6edf3;margin-top:2rem}
pre{background:#161b22;border:1px solid #30363d;border-radius:6px;padding:1rem;overflow-x:auto;font:13px/1.5 'SF Mono',Consolas,monospace;color:#e6edf3}
code{font:13px/1.5 'SF Mono',Consolas,monospace;color:#79c0ff}
p code,li code{background:#161b22;padding:2px 6px;border-radius:3px}
ul,ol{padding-left:1.5rem}
li{margin:.25rem 0}
table{width:100%;border-collapse:collapse;margin:1rem 0}
th,td{text-align:left;padding:.5rem .75rem;border:1px solid #30363d}
th{background:#161b22;color:#f0f6fc;font-weight:600}
td{color:#c9d1d9}
tr:nth-child(even) td{background:#0d1117}
tr:nth-child(odd) td{background:#161b22}
.route-link{font-weight:600}
.tokens{color:#8b949e;font-size:.85em;white-space:nowrap}
.tip{background:#1c2128;border-left:3px solid #58a6ff;padding:.75rem 1rem;margin:1.5rem 0;border-radius:0 6px 6px 0}
.header{margin-bottom:2rem}
.header p{color:#8b949e;font-size:1.1rem;margin:.5rem 0}
nav{margin:1rem 0;display:flex;gap:.5rem;flex-wrap:wrap}
nav a{background:#21262d;padding:.25rem .75rem;border-radius:1rem;font-size:.85rem}
nav a:hover{background:#30363d}
`

const renderIndex = (text: string, route: string): string => {
  const lines = text.split("\n")
  const title = lines[0] ?? "effect-first"
  const routes: Array<{ path: string; tokens: string; desc: string; use: string }> = []
  let tip = ""
  let i = 1
  while (i < lines.length) {
    const line = lines[i] ?? ""
    const routeMatch = line.match(/^\s+(\/\S+)\s+~?(\S+\s+tok)\s+(.*)$/)
    const bundleMatch = line.match(/^\s+(\/bundle\S+)\s+(.*)$/)
    if (routeMatch) {
      const [, path, tokens, desc] = routeMatch
      let use = ""
      // Look ahead for Use: line and extra description lines
      let fullDesc = desc ?? ""
      i++
      while (i < lines.length && (lines[i] ?? "").match(/^\s{10,}/)) {
        const trimmed = (lines[i] ?? "").trim()
        if (trimmed.startsWith("Use:")) {
          use = trimmed.replace(/^Use:\s*/, "")
        } else if (trimmed.startsWith("Token counts")) {
          // skip meta line
        } else if (trimmed.length > 0) {
          fullDesc += " " + trimmed
        }
        i++
      }
      routes.push({ path: path ?? "", tokens: tokens ?? "", desc: fullDesc.trim(), use })
      continue
    }
    if (bundleMatch) {
      const [, path, desc] = bundleMatch
      let use = ""
      i++
      while (i < lines.length && (lines[i] ?? "").match(/^\s{10,}/)) {
        const trimmed = (lines[i] ?? "").trim()
        if (trimmed.startsWith("Use:")) use = trimmed.replace(/^Use:\s*/, "")
        i++
      }
      routes.push({ path: path ?? "", tokens: "", desc: (desc ?? "").trim(), use })
      continue
    }
    if (line.startsWith("Tip:")) {
      tip = line
      i++
      while (i < lines.length && (lines[i] ?? "").length > 0 && !(lines[i] ?? "").match(/^\s+\//)) {
        tip += " " + (lines[i] ?? "").trim()
        i++
      }
      continue
    }
    i++
  }

  const tableRows = routes.map(r => {
    const link = r.path.startsWith("/bundle") 
      ? `<code>${esc(r.path)}</code>`
      : `<a href="${esc(r.path)}" class="route-link"><code>${esc(r.path)}</code></a>`
    return `<tr><td>${link}</td><td class="tokens">${esc(r.tokens)}</td><td>${esc(r.desc)}${r.use ? `<br><em style="color:#8b949e">${esc(r.use)}</em>` : ""}</td></tr>`
  }).join("\n")

  return `<div class="header">
<h1>effect-first</h1>
<p>${esc(title)}</p>
</div>
<nav>${routes.filter(r => !r.path.startsWith("/bundle") && r.path !== "/health").map(r => `<a href="${esc(r.path)}">${esc(r.path)}</a>`).join("")}</nav>
<table>
<thead><tr><th>Route</th><th>Tokens</th><th>Description</th></tr></thead>
<tbody>${tableRows}</tbody>
</table>
${tip ? `<div class="tip">${esc(tip)}</div>` : ""}
<p style="color:#484f58;margin-top:2rem;font-size:.85rem">Content-negotiated: agents receive <code>text/plain</code> via curl/fetch. <a href="https://github.com/acoyfellow/effect-first">Source on GitHub</a></p>`
}

const renderContent = (text: string, route: string): string => {
  const lines = text.split("\n")
  let html = ""
  let i = 0
  let inCode = false

  while (i < lines.length) {
    const line = lines[i] ?? ""

    // Fenced code blocks
    if (line.startsWith("```")) {
      if (!inCode) {
        html += `<pre>`
        inCode = true
        i++
        continue
      } else {
        html += `</pre>`
        inCode = false
        i++
        continue
      }
    }

    if (inCode) {
      html += esc(line) + "\n"
      i++
      continue
    }

    // Indented code blocks (4 spaces)
    if (line.startsWith("    ") && !line.trim().startsWith("-")) {
      html += `<pre>`
      while (i < lines.length && ((lines[i] ?? "").startsWith("    ") || (lines[i] ?? "").trim() === "")) {
        const codeLine = (lines[i] ?? "")
        if (codeLine.trim() === "" && i + 1 < lines.length && !(lines[i + 1] ?? "").startsWith("    ")) break
        html += esc(codeLine.startsWith("    ") ? codeLine.slice(4) : codeLine) + "\n"
        i++
      }
      html += `</pre>`
      continue
    }

    // Headers
    if (line.startsWith("# ")) {
      html += `<h1>${esc(line.slice(2))}</h1>\n`
      i++
      continue
    }
    if (line.startsWith("## ")) {
      html += `<h2>${esc(line.slice(3))}</h2>\n`
      i++
      continue
    }

    // WRONG/RIGHT pairs (anti-patterns)
    if (line.startsWith("WRONG:")) {
      html += `<p style="color:#f85149"><strong>✗</strong> <code>${esc(line.slice(7))}</code></p>\n`
      i++
      continue
    }
    if (line.startsWith("RIGHT:")) {
      html += `<p style="color:#3fb950"><strong>✓</strong> <code>${esc(line.slice(7))}</code></p>\n`
      i++
      continue
    }

    // List items
    if (line.match(/^\s*- /)) {
      html += `<ul>`
      while (i < lines.length && (lines[i] ?? "").match(/^\s*- /)) {
        const item = (lines[i] ?? "").replace(/^\s*- /, "")
        // Inline code in list items
        const escaped = esc(item).replace(/`([^`]+)`/g, '<code>$1</code>')
        html += `<li>${escaped}</li>`
        i++
      }
      html += `</ul>\n`
      continue
    }

    // Blank line
    if (line.trim() === "") {
      i++
      continue
    }

    // Regular paragraph — inline code
    const escaped = esc(line).replace(/`([^`]+)`/g, '<code>$1</code>')
    html += `<p>${escaped}</p>\n`
    i++
  }

  if (inCode) html += `</pre>`

  // Add nav back link
  const nav = `<nav><a href="/">← index</a></nav>`
  return `${nav}\n${html}`
}

export const toHtml = (text: string, route: string): string => {
  const isIndex = route === "/"
  const body = isIndex ? renderIndex(text, route) : renderContent(text, route)
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>effect-first${route !== "/" ? " — " + route : ""}</title><style>${CSS}</style></head><body>${body}</body></html>`
}
