import ts from "typescript"
import { createScoreFromChecks } from "./v4-lib.js"

export const parse = (source: string) =>
  ts.createSourceFile("judge.ts", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)

const walk = (sourceFile: ts.SourceFile, visit: (node: ts.Node) => void) => {
  const loop = (node: ts.Node) => {
    visit(node)
    ts.forEachChild(node, loop)
  }

  loop(sourceFile)
}

const propertyPath = (node: ts.Expression): string | null => {
  if (ts.isIdentifier(node)) {
    return node.text
  }

  if (ts.isPropertyAccessExpression(node)) {
    const left = propertyPath(node.expression)
    return left ? `${left}.${node.name.text}` : null
  }

  return null
}

export const hasImportPath = (sourceFile: ts.SourceFile, modulePath: string) => {
  let found = false

  walk(sourceFile, (node) => {
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      node.moduleSpecifier.text === modulePath
    ) {
      found = true
    }
  })

  return found
}

export const hasCallPath = (sourceFile: ts.SourceFile, path: string) => {
  let found = false

  walk(sourceFile, (node) => {
    if (ts.isCallExpression(node) && propertyPath(node.expression) === path) {
      found = true
    }
  })

  return found
}

export const hasPropertyCall = (sourceFile: ts.SourceFile, property: string) => {
  let found = false

  walk(sourceFile, (node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === property
    ) {
      found = true
    }
  })

  return found
}

export const hasClassNamed = (sourceFile: ts.SourceFile, className: string) => {
  let found = false

  walk(sourceFile, (node) => {
    if (ts.isClassDeclaration(node) && node.name?.text === className) {
      found = true
    }
  })

  return found
}

export const hasClassExtendingText = (sourceFile: ts.SourceFile, snippet: string) => {
  let found = false

  walk(sourceFile, (node) => {
    if (!ts.isClassDeclaration(node) || !node.heritageClauses) {
      return
    }

    for (const clause of node.heritageClauses) {
      if (clause.token !== ts.SyntaxKind.ExtendsKeyword) {
        continue
      }

      for (const type of clause.types) {
        if (type.expression.getText(sourceFile).includes(snippet)) {
          found = true
          return
        }
      }
    }
  })

  return found
}

export const hasYieldIdentifier = (sourceFile: ts.SourceFile, identifier?: string) => {
  let found = false

  walk(sourceFile, (node) => {
    if (!ts.isYieldExpression(node) || !node.expression) {
      return
    }

    if (!identifier) {
      found = true
      return
    }

    if (ts.isIdentifier(node.expression) && node.expression.text === identifier) {
      found = true
    }
  })

  return found
}

export const hasTextInClassHeritage = (sourceFile: ts.SourceFile, text: string) => {
  let found = false

  walk(sourceFile, (node) => {
    if (!ts.isClassDeclaration(node) || !node.heritageClauses) {
      return
    }

    for (const clause of node.heritageClauses) {
      if (clause.getText(sourceFile).includes(text)) {
        found = true
        return
      }
    }
  })

  return found
}

export const hasStringLiteralArgument = (sourceFile: ts.SourceFile, path: string) => {
  let found = false

  walk(sourceFile, (node) => {
    if (!ts.isCallExpression(node) || propertyPath(node.expression) !== path) {
      return
    }

    if (node.arguments.some(ts.isStringLiteral)) {
      found = true
    }
  })

  return found
}

export const buildAstScore = (
  source: string,
  checks: ReadonlyArray<{
    readonly label: string
    readonly passed: (ast: ts.SourceFile) => boolean
  }>
) => {
  const ast = parse(source)

  return createScoreFromChecks(
    checks.map((check) => ({
      label: check.label,
      passed: check.passed(ast),
    }))
  )
}
