import { Schema } from "effect"

export class RuleScore extends Schema.Class<RuleScore>("RuleScore")({
  rule: Schema.String,
  passed: Schema.Boolean,
}) {}

export class ScoreResult extends Schema.Class<ScoreResult>("ScoreResult")({
  totalRules: Schema.Number,
  passedRules: Schema.Number,
  percentage: Schema.Number,
  rules: Schema.Array(RuleScore),
}) {}

export const tallyScore = (rules: Array<{ rule: string; passed: boolean }>): ScoreResult => {
  const totalRules = rules.length
  const passedRules = rules.filter((rule) => rule.passed).length
  const percentage = totalRules === 0 ? 0 : Math.round((passedRules / totalRules) * 100)
  return new ScoreResult({
    totalRules,
    passedRules,
    percentage,
    rules: rules.map((rule) => new RuleScore(rule)),
  })
}

export const rule = (name: string, condition: boolean) => ({
  rule: name,
  passed: condition,
})

export const matchesAny = (content: string, patterns: Array<RegExp | string>): boolean =>
  patterns.some((pattern) => (typeof pattern === "string" ? content.includes(pattern) : pattern.test(content)))
