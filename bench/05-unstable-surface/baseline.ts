import * as Http from "effect/unstable/http"
import { Layer } from "effect"

export const httpModule = Http
export const layer = Layer.succeed("x")
