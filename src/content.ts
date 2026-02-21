import { RULES_TEXT } from "./content/rules.js"
import { REFERENCE_TEXT } from "./content/reference.js"
import { EXAMPLES_TEXT } from "./content/examples.js"
import { ANTI_PATTERNS_TEXT } from "./content/anti-patterns.js"
import { HTTP_SERVER_TEXT } from "./content/http-server.js"
import { HTTP_CLIENT_TEXT } from "./content/http-client.js"
import { SQL_TEXT } from "./content/sql.js"
import { CLI_TEXT } from "./content/cli.js"
import { STREAMS_TEXT } from "./content/streams.js"
import { CONCURRENCY_TEXT } from "./content/concurrency.js"
import { RESOURCES_TEXT } from "./content/resources.js"

export const GUIDE_TEXT = [
  RULES_TEXT,
  REFERENCE_TEXT,
  EXAMPLES_TEXT,
  ANTI_PATTERNS_TEXT,
  HTTP_SERVER_TEXT,
  HTTP_CLIENT_TEXT,
  SQL_TEXT,
  CLI_TEXT,
  STREAMS_TEXT,
  CONCURRENCY_TEXT,
  RESOURCES_TEXT,
].join("\n\n")
