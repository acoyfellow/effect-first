import { RULES_TEXT } from "./content/rules.js"
import { REFERENCE_TEXT } from "./content/reference.js"
import { EXAMPLES_TEXT } from "./content/examples.js"
import { ANTI_PATTERNS_TEXT } from "./content/anti-patterns.js"

export const GUIDE_TEXT = [
  RULES_TEXT,
  REFERENCE_TEXT,
  EXAMPLES_TEXT,
  ANTI_PATTERNS_TEXT,
].join("\n\n")
