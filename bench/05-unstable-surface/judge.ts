import {
  buildAstScore,
  hasCallPath,
  hasClassExtendingText,
  hasClassNamed,
  hasImportPath,
} from "../ast.js"

export const score = (source: string) =>
  buildAstScore(source, [
    {
      label: "unstable import",
      passed: (ast) => hasImportPath(ast, "effect/unstable/http"),
    },
    {
      label: "local service",
      passed: (ast) => hasClassExtendingText(ast, "ServiceMap.Service"),
    },
    {
      label: "layer",
      passed: (ast) => hasCallPath(ast, "Layer.succeed"),
    },
    {
      label: "provide",
      passed: (ast) => hasCallPath(ast, "Effect.provide"),
    },
    {
      label: "adapter name",
      passed: (ast) => hasClassNamed(ast, "HttpAdapter"),
    },
  ])
