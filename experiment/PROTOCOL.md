# local-only restart protocol

This is the first restart experiment for effect-first.

## Hypothesis

Repo-local code and repo-local instructions are enough to create a measurable improvement over a baseline prompt on one fixed Effect v4 coding task.

## Fixed task

- task id: `todo-repo-local-only-001`
- fixture: `experiment/task/fixture`
- implementation target: `experiment/task/fixture/src/todo-repo.ts`

## Arms

- `baseline`
- `local-only`

## Trials

- total trials: `3`
- run cells: `6`

## Primary metric

- `acceptance-test-pass-rate`

Every run is judged only by:

1. whether the output compiles
2. whether the fixed fixture test suite passes

## Strict win rule

`keep-investigating` is allowed only if all of the following are true:

- `local-only` passes all 3 trials
- `baseline` fails all 3 trials
- every `local-only` winner compiles and passes the fixture test suite
- every run artifact is committed and verifiable

Any tie, any baseline pass, any local-only failure, any malformed artifact, or any incomplete run set is `kill`.

## Deadline

- hard deadline: `2026-03-04T23:59:59-05:00`

If all six run cells are not committed and verified by that deadline, the restart result is `kill`.

## Execution order

1. Freeze the fixture.
2. Freeze `experiment/contexts/local-only.txt`.
3. Capture `baseline` trial 1.
4. Capture `local-only` trial 1.
5. Evaluate both in a clean fixture clone.
6. Repeat for trials 2 and 3.
7. Generate `experiment/results.json`.
8. Run `npm run experiment:verify`.
9. Accept the result immediately.
