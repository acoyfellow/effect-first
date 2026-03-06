import {
  buildAstScore,
  hasCallPath,
  hasYieldIdentifier,
} from "../ast.js"

export const score = (source: string) =>
  buildAstScore(source, [
    {
      label: "merge all",
      passed: (ast) => hasCallPath(ast, "Layer.mergeAll"),
    },
    {
      label: "greeter service",
      passed: (ast) => hasYieldIdentifier(ast, "Greeter"),
    },
    {
      label: "repo service",
      passed: (ast) => hasYieldIdentifier(ast, "TodoRepo"),
    },
    {
      label: "effect all",
      passed: (ast) => hasCallPath(ast, "Effect.all"),
    },
    {
      label: "provide",
      passed: (ast) => hasCallPath(ast, "Effect.provide"),
    },
  ])
