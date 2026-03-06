export const tasks = [
  ["01-service-definition", "Service definition and consumption"],
  ["02-tagged-errors", "Tagged errors and targeted recovery"],
  ["03-runtime-edge", "Managed runtime and entrypoint edges"],
  ["04-multi-service", "Multi-service composition"],
  ["05-unstable-surface", "Unstable module boundary design"],
  ["06-real-program", "End-to-end real program"],
] as const

export const arms = [
  "baseline",
  "website-bootstrap-plus-kit",
  "direct-source-on-disk",
] as const

export type Arm = (typeof arms)[number]
export type TaskTuple = (typeof tasks)[number]
