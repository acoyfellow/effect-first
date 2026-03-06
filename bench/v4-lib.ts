export type Score = {
  readonly total: number
  readonly passed: number
  readonly percentage: number
  readonly checks: ReadonlyArray<{
    readonly label: string
    readonly passed: boolean
  }>
}

export const createScoreFromChecks = (
  checks: ReadonlyArray<{
    readonly label: string
    readonly passed: boolean
  }>
): Score => {
  const passed = checks.filter((check) => check.passed).length

  return {
    total: checks.length,
    passed,
    percentage: Math.round((passed / checks.length) * 100),
    checks,
  }
}
