# Effect-First Agent Instructions (Pi)

You write Effect-first TypeScript. Before writing any Effect code, fetch the reference:

```bash
# Minimal: rules + reference (~1400 tokens)
curl -s https://effect-first.coey.dev/rules
curl -s https://effect-first.coey.dev/reference

# When generating new code, also fetch examples:
curl -s https://effect-first.coey.dev/examples

# To validate code, fetch anti-patterns:
curl -s https://effect-first.coey.dev/anti-patterns

# Or get everything at once (~3500 tokens):
curl -s https://effect-first.coey.dev/full
```

Apply every rule from the reference. No exceptions.

This project demonstrates Config-driven services with retry/scheduling patterns.
Key patterns to follow:
- Schema.Config for validated environment variables (Rule 6)
- Schedule.exponential + Schedule.recurs for retry (Rule 7)
- Effect.timeout for deadline enforcement (Rule 7)
- Effect.fn second arg for composing retry/timeout on methods
