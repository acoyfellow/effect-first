# effect-first research

This repo is a research effort about one question: how do we build agents that produce better Effect code, more reliably, with less wasted context?

## What this project is trying to prove

The long-term goal is definitive, citable evidence about what actually helps an agent write strong Effect-first programs.

That means testing guidance mechanisms directly, keeping the raw artifacts, and being clear about what the evidence does and does not support.

## What changed

Earlier versions of this repo treated a website as the primary guidance surface. That historical approach is preserved at [/old](/old).

The active direction is simpler and more skeptical: test whether local, task-relevant repo context helps more than generic prompting, and only keep ideas that survive measurement.

## What is being tested now

The current experiment asks whether a local-first setup can help an agent solve an Effect task better than a baseline prompt.

The first completed run is intentionally small. It is a screening experiment, not a final answer.

## What the current result means

The current result is encouraging, but narrow.

It shows an early signal that local repo guidance may help on this task. It does not yet establish a broad claim about how Effect agents should be built in general.

## What stronger evidence would require

To make a result that someone could reasonably cite as strong evidence, this project still needs more tasks, more runs, and more than one environment or model path.

Until that exists, the honest framing is: promising research direction, not definitive proof.

## Where to look next

1. Read the current protocol in [experiment/PROTOCOL.md](https://github.com/acoyfellow/effect-first/blob/main/experiment/PROTOCOL.md)
2. Read the raw result in [experiment/results.json](https://github.com/acoyfellow/effect-first/blob/main/experiment/results.json)
3. Study the example corpus in [examples/](https://github.com/acoyfellow/effect-first/tree/main/examples)
4. Compare against the preserved historical site at [/old](/old)
