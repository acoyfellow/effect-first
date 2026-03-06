import { Layer, ServiceMap } from "effect"
import { decodeHealthTarget } from "./schema.js"

type HealthTarget = ReturnType<typeof decodeHealthTarget>

export class HealthConfig extends ServiceMap.Service<HealthConfig, {
  readonly target: HealthTarget
}>()("HealthConfig") {}

export const HealthConfigLive = Layer.succeed(HealthConfig)({
  target: decodeHealthTarget({
    url: "https://effect.website/health",
    timeoutMs: 25,
  }),
})
