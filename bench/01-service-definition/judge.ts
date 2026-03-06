import {
  buildAstScore,
  hasCallPath,
  hasClassExtendingText,
  hasYieldIdentifier,
} from "../ast.js"

export const score = (source: string) =>
  buildAstScore(source, [
    {
      label: "service",
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
      label: "yield",
      passed: (ast) => hasYieldIdentifier(ast),
    },
    {
      label: "tagged error",
      passed: (ast) => hasClassExtendingText(ast, "Data.TaggedError"),
    },
  ])
