# effect-first pattern

effect-first is a reference implementation of a local-first agent guidance pattern.

The reusable rule set:

- use a thin public gateway for zero-context discovery
- move the user or agent onto code-on-disk immediately
- keep the canonical guidance in a repo-local kit
- keep runnable examples close to the guidance
- benchmark the mechanism, not just the docs

## Why it may work

The website solves the "what is this?" problem.
The repo solves the "how do I actually write it?" problem.

That split keeps the public surface small while giving agents access to the thing they are best at consuming: local code and local files.

This is a design hypothesis, not a proven efficacy claim, until the live protocol is complete.
