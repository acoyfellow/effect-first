import {
  buildAstScore,
  hasCallPath,
  hasClassExtendingText,
  hasStringLiteralArgument,
  hasTextInClassHeritage,
} from "../ast.js"

export const score = (source: string) =>
  buildAstScore(source, [
    {
      label: "tagged error",
      passed: (ast) => hasClassExtendingText(ast, "Data.TaggedError"),
    },
    {
      label: "catch tag",
      passed: (ast) => hasCallPath(ast, "Effect.catchTag"),
    },
    {
      label: "tag constructor literal",
      passed: (ast) => hasStringLiteralArgument(ast, "Data.TaggedError"),
    },
    {
      label: "fail",
      passed: (ast) => hasCallPath(ast, "Effect.fail"),
    },
    {
      label: "readonly payload",
      passed: (ast) => hasTextInClassHeritage(ast, "readonly"),
    },
  ])
