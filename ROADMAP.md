# effect-first roadmap

## Current thesis

effect-first is no longer a website-first reference server.

The website is the gateway for zero-context entry.
The repo is the working surface.
The `kit/` directory is the canonical source of truth.

## What ships now

- a thin public website
- a shared local v4 kit
- six runnable example integrations
- a deterministic seeded benchmark that tests the mechanism itself
- a live-eval protocol and placeholder artifact that make the missing proof explicit

## Operating model

- Humans or agents discover the project through the website.
- The website pushes them into `kit/BOOTSTRAP.txt`.
- The shared guidance lives in `kit/`.
- Examples demonstrate the patterns in runnable code.
- Seeded evals prove only that the harness is reproducible.
- Live evals are required before the project can claim the mechanism improves output.

## Open work

1. Keep the six examples aligned with the current beta as the upstream API moves.
2. Run the live protocol in `bench/live/PROTOCOL.md` and commit the first real evidence batch.
3. Replace seeded eval data with newly generated task outputs on a regular cadence after the live protocol exists.
4. Publish a standalone write-up of the local-first gateway pattern only after the project can state the evidence boundary precisely.
