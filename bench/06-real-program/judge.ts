import { buildAstScore, hasCallPath } from "../ast.js"

export const score = (source: string) =>
  buildAstScore(source, [
    {
      label: "runtime",
      passed: (ast) => hasCallPath(ast, "ManagedRuntime.make"),
    },
    {
      label: "schedule",
      passed: (ast) => hasCallPath(ast, "Schedule.exponential"),
    },
    {
      label: "retry",
      passed: (ast) => hasCallPath(ast, "Effect.retry"),
    },
    {
      label: "timeout",
      passed: (ast) => hasCallPath(ast, "Effect.timeout"),
    },
    {
      label: "stream fold",
      passed: (ast) => hasCallPath(ast, "Stream.runFold"),
    },
  ])
