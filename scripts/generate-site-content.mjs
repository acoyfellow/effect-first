import { execFileSync } from "node:child_process"
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const experimentDir = path.join(root, "experiment")
const siteDir = path.join(root, "site")
const outputPath = path.join(root, "src", "generated-site-content.ts")
const legacyCommit = "053b01d"

const currentHomepage = readFileSync(path.join(siteDir, "homepage.md"), "utf8").replace(
  /\r\n/g,
  "\n"
)
const experimentResults = JSON.parse(
  readFileSync(path.join(experimentDir, "results.json"), "utf8")
)

const routeDefinitions = [
  [null, "/", "src/content/index.ts", "INDEX_TEXT"],
  ["rules", "/rules", "src/content/rules.ts", "RULES_TEXT"],
  ["reference", "/reference", "src/content/reference.ts", "REFERENCE_TEXT"],
  ["examples", "/examples", "src/content/examples.ts", "EXAMPLES_TEXT"],
  ["anti-patterns", "/anti-patterns", "src/content/anti-patterns.ts", "ANTI_PATTERNS_TEXT"],
  ["http-server", "/http-server", "src/content/http-server.ts", "HTTP_SERVER_TEXT"],
  ["http-client", "/http-client", "src/content/http-client.ts", "HTTP_CLIENT_TEXT"],
  ["sql", "/sql", "src/content/sql.ts", "SQL_TEXT"],
  ["cli", "/cli", "src/content/cli.ts", "CLI_TEXT"],
  ["streams", "/streams", "src/content/streams.ts", "STREAMS_TEXT"],
  ["concurrency", "/concurrency", "src/content/concurrency.ts", "CONCURRENCY_TEXT"],
  ["resources", "/resources", "src/content/resources.ts", "RESOURCES_TEXT"],
]

const readGitFile = (gitPath) =>
  execFileSync("git", ["show", `${legacyCommit}:${gitPath}`], {
    cwd: root,
    encoding: "utf8",
  })

const importGitModule = async (gitPath) => {
  const source = readGitFile(gitPath)
  const href = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
  return import(href)
}

const legacyRouteTextByPath = {}
const legacyModuleTextByName = {}

for (const [moduleName, route, gitPath, exportName] of routeDefinitions) {
  const module = await importGitModule(gitPath)
  const text = module[exportName]
  legacyRouteTextByPath[route] = text
  if (moduleName) {
    legacyModuleTextByName[moduleName] = text
  }
}

legacyRouteTextByPath["/full"] = [
  legacyModuleTextByName.rules,
  legacyModuleTextByName.reference,
  legacyModuleTextByName.examples,
  legacyModuleTextByName["anti-patterns"],
  legacyModuleTextByName["http-server"],
  legacyModuleTextByName["http-client"],
  legacyModuleTextByName.sql,
  legacyModuleTextByName.cli,
  legacyModuleTextByName.streams,
  legacyModuleTextByName.concurrency,
  legacyModuleTextByName.resources,
].join("\n\n")
legacyModuleTextByName.full = legacyRouteTextByPath["/full"]

const file = `export const CURRENT_HOMEPAGE = ${JSON.stringify(currentHomepage, null, 2)} as const

export const EXPERIMENT_RESULTS = ${JSON.stringify(experimentResults, null, 2)} as const

export const LEGACY_ARCHIVE = ${JSON.stringify(
  {
    commit: legacyCommit,
    routeTextByPath: legacyRouteTextByPath,
    moduleTextByName: legacyModuleTextByName,
  },
  null,
  2
)} as const
`

writeFileSync(outputPath, file)
