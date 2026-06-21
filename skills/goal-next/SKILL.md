---
name: goal-next
description: Create and save a local detailed design document for the next project phase or goal from an existing project plan, with role-aware routing for 主策划, 执行策划, 架构师, and 执行程序 sessions. Includes per-round acceptance gates, self-check/debug/architecture-review standards, and strong quality constraints. If the current session role is unclear, ask the user to choose a role before planning. Use when a user asks an AI agent to plan the next phase, turn a roadmap phase into executable design docs, define round-by-round self-check standards, impose strict coding guardrails, or prepare planning work for design or development agents. Planning output must be written to a local project document unless the user explicitly forbids file changes.
---

# GoalNext

## Purpose

Use this skill before implementation begins for a new phase or goal. It routes
the planning work by session role, then converts the roadmap item into a
practical execution document with scope, content or architecture boundaries,
round plan, verification gates, and quality constraints.

## Local Document Requirement

Planning work must produce a local document, not only a chat response. Save the
document in the project's documentation area, usually `docs/`, unless the user
provides another path or explicitly forbids file changes.

Use a clear filename that includes the project, phase or goal, and planning
purpose, such as:

- `docs/<PROJECT>_Phase_<N>_Design_CN.md`
- `docs/<PROJECT>_Design_Work_Roadmap_CN.md`
- `docs/<PROJECT>_<GOAL>_Plan.md`

Before finishing, verify that the file exists, has the expected sections, and
can be handed to another AI without relying on chat history.

## Session Role Gate

Before planning, determine the current session role from explicit user,
system, developer, or thread context:

- `主策划`: Own overall game design, content direction, player experience,
  content bible scope, and design acceptance standards.
- `执行策划`: Produce implementable design content, tables, templates, scenario
  specs, event libraries, NPC/faction entries, and content QA criteria.
- `架构师`: Own technical architecture, data contracts, module boundaries,
  quality gates, verification strategy, and handoff constraints.
- `执行程序`: Plan implementation work against existing architecture and product
  specs, including files, modules, tests, and integration order.

If the role is unclear, conflicting, or only implied weakly, ask the user:

```text
请先确认当前会话角色：主策划、执行策划、架构师、执行程序。确认后我再继续规划下一阶段。
```

Do not continue planning until the role is known.

## Role Routing

After the role is known, shape the output as follows:

- `主策划`: Create strategic design plans. Emphasize player fantasy, core loop,
  content richness, playable experience, world logic, design pillars,
  non-goals, and content acceptance standards. Avoid implementation details
  beyond the fields needed for handoff.
- `执行策划`: Create executable content plans. Emphasize schemas, content tables,
  triggers, numeric ranges, event text requirements, scenario setup, examples,
  QA checklists, and handoff notes for engineering.
- `架构师`: Create architecture plans. Emphasize system boundaries, module
  contracts, data models, dependency direction, test strategy, maintainability,
  and constraints that prevent tangled implementation.
- `执行程序`: Create implementation plans. Emphasize concrete files, commands,
  tests, integration order, risks, coding constraints, and done criteria. Do not
  redesign product direction unless the plan is blocked by missing design.

## Optimized Prompt Template

Use or adapt this prompt when handing planning work to another AI agent:

```text
Create a detailed implementation design for the next project phase.

Session role:
<SESSION_ROLE: 主策划 | 执行策划 | 架构师 | 执行程序 | unknown>

Project context:
<PROJECT_DOCS>

Current phase:
<CURRENT_PHASE>

Target next phase:
<NEXT_PHASE>

Local document path:
<OUTPUT_DOC_PATH>

Before writing the document, identify the session role. If it is unknown or
ambiguous, ask the user to choose one of: 主策划, 执行策划, 架构师, 执行程序.

Write the completed plan to <OUTPUT_DOC_PATH>. Do not treat the chat response as
the primary artifact unless the user explicitly forbids local file changes.

Output a role-routed phase design document that includes:
1. Phase objective and non-goals.
2. Required reading from the existing project documents.
3. Role-specific scope:
   - 主策划: player experience, design pillars, content direction, acceptance
     standards
   - 执行策划: content schemas, examples, triggers, tables, QA rules
   - 架构师: data contracts, module boundaries, quality gates, verification
     strategy
   - 执行程序: files, modules, commands, tests, implementation order
4. Architecture or design boundaries that must not be violated.
5. Data models, content schemas, modules, APIs, commands, screens, or workflows
   to be created or changed.
6. A round-by-round execution plan with estimated round count.
7. For each round:
   - goal
   - files or modules likely affected
   - expected deliverables
   - acceptance criteria
   - required tests or verification commands
   - self-check checklist
   - debug checklist
   - architecture alignment checklist
8. Strong quality constraints that prevent tangled implementation or content
   bloat:
   - keep domain logic separate from UI and infrastructure
   - use explicit types or schemas for shared data
   - keep design content system-readable, with fields and triggers
   - keep functions and modules cohesive
   - avoid hidden global state and circular dependencies
   - avoid speculative abstractions and unrelated refactors
   - require tests for risky behavior
   - require deterministic behavior where reproducibility matters
9. Risks, open questions, and decisions that must be resolved before execution.
10. The local document path and verification result.

The document must be specific enough that a separate development AI can execute
the phase without inventing architecture or design direction on the fly. Do not
write production code yet unless explicitly asked.
```

## Workflow

1. Determine the session role. Ask the user if it is unclear.
2. Read the project plan, design docs, current code structure, and any existing
   architecture or content notes relevant to the role.
3. Identify the next phase and its relationship to the previous phase.
4. Define the phase objective in one sentence.
5. Define non-goals to stop scope creep.
6. Map the phase onto the role-appropriate artifacts: design pillars, content
   schemas, data contracts, user flows, modules, tests, commands, or QA checks.
7. Split the phase into rounds. Each round should be independently reviewable.
8. Define quality gates before any code or content production begins.
9. Save the design document in the project documentation area.
10. Verify the saved file exists and contains the required sections before
   reporting completion.

## Design Document Structure

Use this structure unless the project already has a stronger local template:

```markdown
# <Project> Phase <N> Detailed Design

## 1. Objective
## 2. Non-Goals
## 3. Required Context
## 4. Session Role and Routing Decision
## 5. Design or Architecture Constraints
## 6. Data, Content, and Module Design
## 7. User or System Workflows
## 8. Round Plan
## 9. Round Self-Check Standards
## 10. Debug Standards
## 11. Architecture Review Standards
## 12. Code and Content Quality Constraints
## 13. Verification Commands or Review Methods
## 14. Risks and Open Questions
## 15. Handoff Prompt for the Next AI
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
- The planning artifact was saved to a local file and the path is recorded.

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

## Content Design Review Standard

For `主策划` and `执行策划` sessions, also check:

- Content supports the core player fantasy and current phase objective.
- Content is system-readable, with fields, triggers, conditions, and outcomes.
- Player-facing feedback is defined.
- Richness comes from reusable content pools, not one-off exceptions.
- Design entries can be tested or reviewed by another AI.

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
- For planning/content work, avoid vague lore-only entries; require fields,
  triggers, examples, player feedback, and acceptance criteria.

## Handoff Output

End the document with an implementation prompt that names:

- the phase to execute
- the planned round count
- the required documents to read first
- the session role to use
- the first round goal
- the self-check/debug/architecture gates that must be used before advancing
- the local document path to use as the source of truth
