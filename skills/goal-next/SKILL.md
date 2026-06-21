---
name: goal-next
description: Create the detailed design document for the next project phase from an existing project plan, including per-round acceptance gates, self-check/debug/architecture-review standards, and strong code quality constraints to prevent brittle, tangled, or unmaintainable implementation. Use when a user asks an AI agent to plan the next phase, turn a roadmap phase into executable design docs, define round-by-round self-check standards, or impose strict coding guardrails before implementation.
---

# GoalNext

## Purpose

Use this skill before implementation begins for a new phase. It converts a
roadmap phase into a practical execution document with scope, architecture,
round plan, verification gates, and code constraints.

## Optimized Prompt Template

Use or adapt this prompt when handing planning work to another AI agent:

```text
Create a detailed implementation design for the next project phase.

Project context:
<PROJECT_DOCS>

Current phase:
<CURRENT_PHASE>

Target next phase:
<NEXT_PHASE>

Output a phase design document that includes:
1. Phase objective and non-goals.
2. Required reading from the existing project documents.
3. Architecture assumptions and boundaries that must not be violated.
4. Data models, modules, APIs, commands, screens, or workflows to be created or
   changed.
5. A round-by-round execution plan with estimated round count.
6. For each round:
   - goal
   - files or modules likely affected
   - expected deliverables
   - acceptance criteria
   - required tests or verification commands
   - self-check checklist
   - debug checklist
   - architecture alignment checklist
7. Strong code constraints that prevent tangled implementation:
   - keep domain logic separate from UI and infrastructure
   - use explicit types or schemas for shared data
   - keep functions and modules cohesive
   - avoid hidden global state and circular dependencies
   - avoid speculative abstractions and unrelated refactors
   - require tests for risky behavior
   - require deterministic behavior where reproducibility matters
8. Risks, open questions, and decisions that must be resolved before coding.

The document must be specific enough that a separate development AI can execute
the phase without inventing architecture on the fly. Do not write production
code yet unless explicitly asked.
```

## Workflow

1. Read the project plan, design docs, current code structure, and any existing
   architecture notes.
2. Identify the next phase and its relationship to the previous phase.
3. Define the phase objective in one sentence.
4. Define non-goals to stop scope creep.
5. Map the phase onto modules, data contracts, user flows, tests, and commands.
6. Split the phase into rounds. Each round should be independently reviewable.
7. Define quality gates before any code is written.
8. Save the design document in the project documentation area if the user asks
   for a local artifact.

## Design Document Structure

Use this structure unless the project already has a stronger local template:

```markdown
# <Project> Phase <N> Detailed Design

## 1. Objective
## 2. Non-Goals
## 3. Required Context
## 4. Architecture Constraints
## 5. Data and Module Design
## 6. User or System Workflows
## 7. Round Plan
## 8. Round Self-Check Standards
## 9. Debug Standards
## 10. Architecture Review Standards
## 11. Code Quality Constraints
## 12. Verification Commands
## 13. Risks and Open Questions
## 14. Handoff Prompt for Implementation AI
```

## Round Self-Check Standard

Every implementation round must verify:

- The round goal is complete or explicitly blocked.
- The artifact matches the phase design.
- Acceptance criteria are checked one by one.
- Tests, builds, previews, or static checks were run when available.
- Any failing check has a named cause and next action.
- No unrelated refactor or behavior change was introduced.
- Documentation, commands, and examples were updated when affected.

## Debug Standard

Debugging must be evidence-driven:

- Reproduce the issue or identify the missing verification surface.
- Inspect the smallest relevant logs, tests, stack traces, diffs, and state.
- Fix root cause, not symptoms.
- Re-run the exact failing check.
- Add regression coverage when the bug represents persistent behavior risk.

## Architecture Review Standard

Before leaving a round, check:

- Layer boundaries are intact.
- Public APIs and data models are explicit.
- State ownership is clear.
- Side effects are isolated.
- Dependency direction is intentional.
- The code remains easy for the next AI or developer to extend.
- The implementation still reflects the project documents rather than a new,
  undocumented architecture.

## Code Quality Constraints

Use these as hard constraints unless project documents override them:

- Prefer simple, cohesive modules over large catch-all files.
- Keep shared domain rules in one place.
- Do not duplicate business logic across UI, tests, and services.
- Do not introduce hidden mutable globals for convenience.
- Do not mix rendering, persistence, and domain simulation in the same function.
- Do not add a framework, dependency, or abstraction without a concrete need.
- Name concepts consistently with project documents.
- Keep changes small enough to review.
- Add tests proportional to risk and blast radius.
- Treat deterministic behavior as a contract when simulations, generation, or
  saves are involved.

## Handoff Output

End the document with an implementation prompt that names:

- the phase to execute
- the planned round count
- the required documents to read first
- the first round goal
- the self-check/debug/architecture gates that must be used before advancing
