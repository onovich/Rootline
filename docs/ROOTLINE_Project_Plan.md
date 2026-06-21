# ROOTLINE Project Plan

## 1. Project Understanding

ROOTLINE is a simulation-first underground civilization CRPG where the
primary game object is not a tile map, but a mutable cave graph. Caverns are
nodes, tunnels are edges, and every topology change can reshape survival,
economy, belief, conflict, migration, and faction history.

The player is a cave surveyor, mapper, or intervention agent. The core fantasy
is to explore unknown cave nodes, understand belief-driven societies, alter
connectivity, and watch civilization respond through systemic consequences.

The project should prioritize deterministic simulation, inspectable state, and
emergent narrative before visual richness. ASCII rendering is the first
presentation layer because it supports rapid iteration, clear debugging, and
future replacement by sprites or richer visuals.

## 2. Design Pillars

- Topology is gameplay: connections, cuts, collapses, and access routes drive
  strategy and narrative.
- Simulation is the source of truth: rendering and UI expose the world state but
  do not own it.
- Belief systems create behavior: factions should feel different because their
  values constrain what they do.
- Emergent history matters: quests, events, and stories are state
  transformations, not only scripted content.
- AI generation is validated by simulation: generated worlds must be filtered
  for stability, playability, and narrative richness.

## 3. MVP Scope

The first playable version should prove the central loop:

1. Generate or load a small cave graph.
2. Explore nodes and reveal fog of war.
3. Encounter at least three belief-driven factions.
4. Modify topology by opening, sealing, or collapsing edges.
5. Run tick simulation for resources, relations, migration, and events.
6. Display world state through ASCII glyphs, colors, and an event log.
7. Save and reload a complete simulation snapshot.

Out of scope for the MVP:

- Large-scale world generation.
- Final art direction beyond ASCII.
- Full CRPG dialogue trees.
- Advanced combat depth.
- Online or multiplayer systems.

## 4. Recommended Architecture

### Simulation Core

- Cave graph model: nodes, edges, stability, resources, occupants, visibility.
- Tick engine: deterministic update order, fixed tick duration, seedable random
  source.
- Entity model: NPCs, squads, factions, resources, events.
- Rule systems: resource flow, stability, belief constraints, faction relations.

### Interaction Layer

- Player commands for explore, connect, sever, inspect, wait, mediate, and
  assign squads.
- Selection and inspection tools for nodes, edges, factions, NPCs, and history.
- Pause and tick stepping for simulation debugging.

### Presentation Layer

- ASCII renderer for graph overview, node detail, faction markers, resource
  markers, fog of war, instability, and event feed.
- Layout should keep simulation state readable before becoming decorative.

### AI Content Layer

- Offline generators for cave graphs, factions, beliefs, and event seeds.
- Simulation validator that runs many ticks and scores generated seeds.
- Export format for playable world seeds and narrative summaries.

## 5. Milestones

### Milestone 0: Repository Foundation

Deliverables:

- Project documents committed to source control.
- Initial project plan documented.
- Basic repository hygiene in place.

Acceptance criteria:

- Repository can be cloned from the configured remote.
- Docs clearly describe design, technical direction, and execution plan.

### Milestone 1: Simulation Prototype

Deliverables:

- In-memory cave graph with nodes and edges.
- Deterministic tick engine.
- Resource flow across connected nodes.
- Stability changes and collapse events.
- Minimal debug output.

Acceptance criteria:

- A fixed seed produces the same simulation history every run.
- Connecting or severing an edge changes resource and faction outcomes.

### Milestone 2: ASCII Playable Loop

Deliverables:

- ASCII graph renderer.
- Player commands for explore, inspect, connect, sever, and wait.
- Fog of war and event history.
- Three factions with different belief constraints.

Acceptance criteria:

- A player can complete the full MVP loop in a small scenario.
- The event log explains why major world changes occurred.

### Milestone 3: Belief-Driven Factions

Deliverables:

- Belief system schema.
- Faction policy logic for allowed actions and priorities.
- Relations model for trust, hostility, dependency, and taboo violations.
- Migration and conflict triggers.

Acceptance criteria:

- Factions respond differently to the same topology change.
- Belief violations affect relations and future decisions.

### Milestone 4: Combat Prototype

Deliverables:

- Squad model.
- Tick-resolved combat.
- Graph-based line of sight and cover.
- Collapse and chokepoint tactics.

Acceptance criteria:

- Combat outcomes depend on graph topology, not only unit stats.
- Player intervention can create meaningful tactical advantages or disasters.

### Milestone 5: AI Generation and Validation

Deliverables:

- Cave graph generator.
- Faction and belief generator.
- Event seed generator.
- Batch simulation validator.
- Seed scoring for stability, narrative richness, and playability.

Acceptance criteria:

- Generated seeds can be filtered into playable and rejected sets.
- Validator output explains the reason for acceptance or rejection.

### Milestone 6: Save System and Scenario Packaging

Deliverables:

- Full graph snapshot save/load.
- NPC, faction, relation, and event history persistence.
- Scenario package format.
- Regression tests for deterministic saves.

Acceptance criteria:

- Loading a save and continuing produces expected deterministic behavior.
- Scenarios can be shared as compact seed or snapshot files.

## 6. Near-Term Task List

- Choose implementation stack for the first prototype.
- Define the canonical data schema for nodes, edges, factions, NPCs, and events.
- Create a tiny hand-authored cave graph for deterministic tests.
- Implement tick order and seedable randomness.
- Add resource flow and stability update rules.
- Add an ASCII debug view before building richer interaction.
- Write tests around graph mutation, resource flow, and collapse behavior.

## 7. Key Design Questions

- Should the first client be terminal-native, browser-based, or a desktop shell?
- Is the player physically present in the cave network or an abstract
  intervention layer?
- How much direct control should the player have over factions and squads?
- Should belief systems be hard constraints, weighted preferences, or both?
- What makes a generated world "playable" versus merely stable?

## 8. Major Risks

- Scope creep from trying to build a full CRPG before the topology loop is fun.
- AI-generated content producing lore without meaningful simulation pressure.
- Faction behavior becoming opaque unless event explanations are first-class.
- Combat overpowering the civilization simulation instead of serving it.
- Graph abstraction feeling too detached unless exploration and consequences are
  visible and immediate.

## 9. Execution Principle

Build the smallest deterministic simulation that makes one topology change feel
consequential. Once that works, expand content, combat, and generation around
the proven loop.
