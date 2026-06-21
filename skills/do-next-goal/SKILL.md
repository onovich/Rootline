---
name: do-next-goal
description: Execute a project goal through planned rounds with goal-mode tracking, strict round budgets, end-of-round self-checks, debugging, architecture review, and explicit acceptance gates before advancing. Use when a user asks an AI agent to complete upcoming goals, follow a project plan by rounds or phases, work in "goal mode", continue until the goal is done, or self-check/debug/review architecture after each round.
---

# DoNextGoal

## Purpose

Use this skill to convert a broad project goal into controlled execution rounds.
Each round must end with verification, debugging, architecture review, and an
advance/block decision.

## Optimized Prompt Template

Use or adapt this prompt when handing work to another AI agent:

```text
Use goal-driven execution for this task.

Goal:
<GOAL>

Project context:
<PROJECT_DOCS_OR_REPO_CONTEXT>

Planned round budget:
<ROUND_BUDGET> rounds, unless the goal is completed earlier or a real blocker
requires user input.

Execution rules:
1. Activate goal tracking if your environment supports it. If not, maintain an
   explicit goal ledger in your responses.
2. Before implementation, restate the goal, success criteria, known constraints,
   and the planned rounds.
3. Complete one concrete round at a time. Each round must produce a shippable or
   reviewable artifact: code, tests, docs, design decisions, or verified fixes.
4. At the end of every round, run a self-check that includes:
   - acceptance criteria check
   - test or verification results
   - debug pass for errors, edge cases, and regressions
   - architecture alignment check against project documents and existing code
   - code quality check for simplicity, cohesion, naming, duplication, and
     maintainability
5. Only advance to the next round if the current round passes its gate. If it
   fails, debug and repair before continuing.
6. Do not skip verification to save time. If a verification command cannot run,
   explain why and perform the strongest available substitute check.
7. Keep changes scoped to the current goal. Do not refactor unrelated areas.
8. Stop only when the goal is complete, the round budget is exhausted with a
   clear remaining-work report, or a genuine blocker requires user input.

Final response:
- State whether the goal is complete.
- Summarize completed rounds.
- List verification performed.
- Note remaining risks or next recommended round.
```

## Workflow

1. Read the project documents, current plan, and relevant code before editing.
2. Define the goal in measurable terms.
3. Break the work into a small number of rounds.
4. For each round:
   - select one concrete target
   - implement or document it
   - verify it
   - debug failures
   - review architecture fit
   - record pass/fail status
5. Continue only after the gate passes.
6. End with a concise completion report.

## Round Gate

A round passes only when all applicable checks are true:

- The intended artifact exists and is in the expected location.
- Tests, builds, previews, or document validation were run when available.
- Known failures were fixed or explicitly documented with rationale.
- The implementation follows the current project architecture.
- New code is cohesive, named clearly, and does not add unnecessary abstractions.
- The round did not introduce unrelated changes.
- The next round has a clear target.

## Architecture Review Checklist

- Preserve existing boundaries between domain, application, UI, persistence, and
  infrastructure layers.
- Keep simulation or business logic independent from presentation code unless
  the project architecture says otherwise.
- Prefer explicit data schemas over implicit object shapes.
- Avoid circular dependencies, hidden global state, and cross-layer shortcuts.
- Make behavior deterministic where the project requires reproducibility.
- Add tests at the same layer as the risk introduced.

## Failure Handling

If a round fails its gate:

1. Name the failing criterion.
2. Inspect logs, failing tests, diffs, and relevant files.
3. Fix the smallest responsible cause.
4. Re-run verification.
5. Only continue after the gate passes or after documenting a real blocker.

Do not hide partial failures behind vague progress summaries.
