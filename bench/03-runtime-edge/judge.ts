import {
  buildAstScore,
  hasCallPath,
  hasPropertyCall,
  hasYieldIdentifier,
} from "../ast.js"

export const score = (source: string) =>
  buildAstScore(source, [
    {
      label: "managed runtime",
      passed: (ast) => hasCallPath(ast, "ManagedRuntime.make"),
    },
    {
      label: "run promise",
      passed: (ast) => hasPropertyCall(ast, "runPromise"),
    },
    {
      label: "dispose",
      passed: (ast) => hasPropertyCall(ast, "dispose"),
    },
    {
      label: "generator",
      passed: (ast) => hasCallPath(ast, "Effect.gen"),
    },
    {
      label: "yield service",
      passed: (ast) => hasYieldIdentifier(ast),
    },
  ])
