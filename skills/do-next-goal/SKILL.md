---
name: do-next-goal
description: Execute the next project goal through planned rounds with role-aware routing for 主策划, 执行策划, 架构师, and 执行程序 sessions, goal-mode tracking, strict round budgets, end-of-round self-checks, debugging, architecture or content review, and explicit acceptance gates before advancing. If the current session role is unclear, ask the user to choose a role before execution. Use when a user asks an AI agent to complete upcoming goals, follow a project plan by rounds or phases, work in goal mode, continue until the goal is done, or self-check/debug/review architecture or design after each round.
---

# DoNextGoal

## Purpose

Use this skill to convert a broad project goal into controlled execution rounds.
It first routes the work by session role, then requires each round to end with
verification, debugging, architecture or content review, and an advance/block
decision.

## Session Role Gate

Before execution, determine the current session role from explicit user,
system, developer, or thread context:

- `主策划`: Execute high-level design direction, content roadmap decisions,
  player experience definitions, design principles, and acceptance standards.
- `执行策划`: Execute detailed content production, tables, event templates,
  faction/NPC/scenario entries, content QA, and implementation-ready specs.
- `架构师`: Execute architecture design, data contracts, module boundaries,
  technical standards, verification plans, and refactor constraints.
- `执行程序`: Execute code, tests, integration, debugging, and implementation
  work within the approved architecture and design specs.

If the role is unclear, conflicting, or only implied weakly, ask the user:

```text
请先确认当前会话角色：主策划、执行策划、架构师、执行程序。确认后我再继续执行下一目标。
```

Do not continue execution until the role is known.

## Role Routing

After the role is known, execute the goal as follows:

- `主策划`: Produce strategic design artifacts. Verify player value, core loop
  alignment, content richness, non-goals, and design acceptance standards.
  Avoid code and low-level implementation unless requested.
- `执行策划`: Produce system-readable content artifacts. Verify fields,
  triggers, numeric ranges, examples, player feedback, QA checks, and handoff
  usability for engineering.
- `架构师`: Produce architecture artifacts. Verify module boundaries, data
  contracts, dependency direction, test strategy, maintainability, and code
  constraints before handing work to programmers.
- `执行程序`: Produce code and tests. Verify builds, tests, runtime behavior,
  architecture fit, deterministic behavior when required, and scoped diffs.

## Optimized Prompt Template

Use or adapt this prompt when handing work to another AI agent:

```text
Use goal-driven execution for this task.

Session role:
<SESSION_ROLE: 主策划 | 执行策划 | 架构师 | 执行程序 | unknown>

Goal:
<GOAL>

Project context:
<PROJECT_DOCS_OR_REPO_CONTEXT>

Planned round budget:
<ROUND_BUDGET> rounds, unless the goal is completed earlier or a real blocker
requires user input.

Execution rules:
1. Identify the session role. If it is unknown or ambiguous, ask the user to
   choose one of: 主策划, 执行策划, 架构师, 执行程序.
2. Activate goal tracking if your environment supports it. If not, maintain an
   explicit goal ledger in your responses.
3. Before execution, restate the role, goal, success criteria, known
   constraints, and the planned rounds.
4. Complete one concrete round at a time. Each round must produce a shippable or
   reviewable artifact: code, tests, docs, design decisions, content tables,
   event templates, scenarios, architecture notes, or verified fixes.
5. At the end of every round, run a self-check that includes:
   - acceptance criteria check
   - test or verification results
   - debug pass for errors, edge cases, and regressions
   - architecture alignment check against project documents and existing code
   - content/design alignment check when the role is 主策划 or 执行策划
   - code quality check for simplicity, cohesion, naming, duplication, and
     maintainability
6. Only advance to the next round if the current round passes its gate. If it
   fails, debug and repair before continuing.
7. Do not skip verification to save time. If a verification command cannot run,
   explain why and perform the strongest available substitute check.
8. Keep changes scoped to the current goal. Do not refactor unrelated areas or
   expand design scope without approval.
9. Stop only when the goal is complete, the round budget is exhausted with a
   clear remaining-work report, or a genuine blocker requires user input.

Final response:
- State the session role used.
- State whether the goal is complete.
- Summarize completed rounds.
- List verification performed.
- Note remaining risks or next recommended round.
```

## Workflow

1. Determine the session role. Ask the user if it is unclear.
2. Read the project documents, current plan, and role-relevant materials before
   editing or producing content.
3. Define the goal in measurable terms.
4. Break the work into a small number of rounds.
5. For each round:
   - select one concrete target
   - implement, document, or produce the role-appropriate content artifact
   - verify it
   - debug failures
   - review architecture or content fit
   - record pass/fail status
6. Continue only after the gate passes.
7. End with a concise completion report.

## Round Gate

A round passes only when all applicable checks are true:

- The intended artifact exists and is in the expected location.
- Tests, builds, previews, or document validation were run when available.
- Known failures were fixed or explicitly documented with rationale.
- The implementation follows the current project architecture.
- New code is cohesive, named clearly, and does not add unnecessary abstractions.
- New content is system-readable, scoped, and backed by triggers, examples, or
  acceptance criteria when the role is 主策划 or 执行策划.
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

## Content Review Checklist

Use this checklist for `主策划` and `执行策划` sessions:

- Preserve the core player fantasy and current phase objective.
- Keep content modular: roles, factions, events, scenarios, NPCs, resources, and
  regions should remain separable.
- Require fields, triggers, conditions, outcomes, examples, and player-visible
  feedback for content entries.
- Avoid lore-only output that cannot be turned into data or tests.
- Confirm the artifact can be handed to engineering or another design AI.

## Failure Handling

If a round fails its gate:

1. Name the failing criterion.
2. Inspect logs, failing tests, diffs, relevant files, content tables, or design
   criteria.
3. Fix the smallest responsible cause.
4. Re-run verification.
5. Only continue after the gate passes or after documenting a real blocker.

Do not hide partial failures behind vague progress summaries.
