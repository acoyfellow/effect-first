const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

const renderInline = (value: string) =>
  escapeHtml(value)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/`([^`]+)`/g, "<code>$1</code>")

const renderMarkdown = (markdown: string) => {
  const lines = markdown.split("\n")
  let html = ""
  let inCode = false
  let inList: "ul" | "ol" | null = null

  const closeList = () => {
    if (inList) {
      html += `</${inList}>`
      inList = null
    }
  }

  for (const line of lines) {
    if (line.startsWith("```")) {
      closeList()
      html += inCode ? "</pre>" : "<pre>"
      inCode = !inCode
      continue
    }

    if (inCode) {
      html += `${escapeHtml(line)}\n`
      continue
    }

    if (line.trim().length === 0) {
      closeList()
      continue
    }

    if (line.startsWith("# ")) {
      closeList()
      html += `<h1>${renderInline(line.slice(2))}</h1>`
      continue
    }

    if (line.startsWith("## ")) {
      closeList()
      html += `<h2>${renderInline(line.slice(3))}</h2>`
      continue
    }

    if (line.startsWith("### ")) {
      closeList()
      html += `<h3>${renderInline(line.slice(4))}</h3>`
      continue
    }

    if (line.startsWith("- ")) {
      if (inList !== "ul") {
        closeList()
        html += "<ul>"
        inList = "ul"
      }
      html += `<li>${renderInline(line.slice(2))}</li>`
      continue
    }

    if (line.match(/^\d+\. /)) {
      if (inList !== "ol") {
        closeList()
        html += "<ol>"
        inList = "ol"
      }
      html += `<li>${renderInline(line.replace(/^\d+\. /, ""))}</li>`
      continue
    }

    closeList()
    html += `<p>${renderInline(line)}</p>`
  }

  closeList()

  if (inCode) {
    html += "</pre>"
  }

  return html
}

const css = `
:root{
  color-scheme: light;
  --bg:#f7f1e3;
  --card:#fffaf0;
  --ink:#1f2933;
  --muted:#52606d;
  --line:#d9cbb2;
  --accent:#0b6e4f;
  --accent-soft:#e5f6ef;
  --code:#f1ebdc;
}
*{box-sizing:border-box}
body{
  margin:0;
  background:radial-gradient(circle at top right,#fffaf0 0%,#f7f1e3 55%,#efe5cf 100%);
  color:var(--ink);
  font:16px/1.7 "Iowan Old Style","Palatino Linotype","Book Antiqua",serif;
}
main{
  max-width:880px;
  margin:0 auto;
  padding:2.5rem 1.25rem 4rem;
}
.frame{
  background:rgba(255,250,240,0.92);
  border:1px solid var(--line);
  border-radius:24px;
  padding:2rem;
  box-shadow:0 18px 48px rgba(31,41,51,0.08);
}
.eyebrow{
  margin:0 0 0.75rem;
  text-transform:uppercase;
  letter-spacing:0.08em;
  font:700 0.78rem/1.2 "Avenir Next",Helvetica,sans-serif;
  color:var(--accent);
}
.lead{
  margin:0 0 1.25rem;
  color:var(--muted);
  font:600 1rem/1.5 "Avenir Next",Helvetica,sans-serif;
}
.actions{
  display:flex;
  flex-wrap:wrap;
  gap:0.75rem;
  margin:0 0 1.5rem;
}
.actions a{
  display:inline-flex;
  align-items:center;
  border-radius:999px;
  padding:0.55rem 0.95rem;
  background:var(--accent-soft);
  color:var(--accent);
  text-decoration:none;
  font:600 0.9rem/1 "Avenir Next",Helvetica,sans-serif;
}
.actions a:hover{text-decoration:underline}
.appendix{
  margin-top:1.75rem;
  padding-top:1.25rem;
  border-top:1px solid var(--line);
}
h1,h2,h3{
  font-family:"Avenir Next","Helvetica Neue",sans-serif;
  line-height:1.2;
  margin:1.5rem 0 0.75rem;
}
h1{margin-top:0;font-size:2.15rem}
h2{font-size:1.3rem}
h3{font-size:1.05rem}
p,li{margin:0 0 0.7rem}
ul,ol{padding-left:1.4rem;margin:0.25rem 0 1rem}
pre{
  margin:1rem 0;
  overflow:auto;
  border-radius:16px;
  border:1px solid var(--line);
  padding:1rem;
  background:var(--code);
  font:13px/1.55 "SFMono-Regular","Menlo",monospace;
}
code{
  padding:0.05rem 0.3rem;
  border-radius:6px;
  background:var(--code);
  font:0.92em/1.4 "SFMono-Regular","Menlo",monospace;
}
a{color:var(--accent)}
table{
  width:100%;
  border-collapse:collapse;
  margin-top:1rem;
  font-family:"Avenir Next","Helvetica Neue",sans-serif;
}
th,td{
  padding:0.6rem 0.75rem;
  border-bottom:1px solid var(--line);
  text-align:left;
}
th{font-size:0.85rem;text-transform:uppercase;letter-spacing:0.04em;color:var(--muted)}
`

export const toHtml = (
  title: string,
  markdown: string,
  options: {
    readonly eyebrow?: string
    readonly lead?: string
    readonly actions?: ReadonlyArray<{ readonly href: string; readonly label: string }>
    readonly appendixHtml?: string
    readonly scripts?: ReadonlyArray<string>
  } = {}
) => {
  const actions =
    options.actions && options.actions.length > 0
      ? `<div class="actions">${options.actions
          .map((action) => `<a href="${action.href}">${escapeHtml(action.label)}</a>`)
          .join("")}</div>`
      : ""

  const appendix = options.appendixHtml
    ? `<section class="appendix">${options.appendixHtml}</section>`
    : ""

  const scriptTags =
    options.scripts && options.scripts.length > 0
      ? options.scripts
          .map((src) => `<script async src="${escapeHtml(src)}" charset="utf-8"></script>`)
          .join("\n  ")
      : ""

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>${css}</style>
</head>
<body>
  <main>
    <section class="frame">
      ${options.eyebrow ? `<p class="eyebrow">${escapeHtml(options.eyebrow)}</p>` : ""}
      ${options.lead ? `<p class="lead">${escapeHtml(options.lead)}</p>` : ""}
      ${actions}
      ${renderMarkdown(markdown)}
      ${appendix}
    </section>
  </main>
  ${scriptTags}
</body>
</html>`
}
