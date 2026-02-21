export const ruleAbsent = (name: string, source: string, patterns: Array<RegExp | string>) => ({
  rule: name,
  passed: !patterns.some((pattern) =>
    typeof pattern === "string" ? source.includes(pattern) : pattern.test(source)
  ),
})
