# ROOTLINE: Underground Root Civilization CRPG

## Technical Design Document

## 1. System Overview

Goal: Build a graph-based underground civilization CRPG with tick
simulation, RimWorld-style combat, belief-driven factions, and
ASCII-based rendering.

Core pillars: - Graph-based cave world - Tick-based simulation engine -
Belief-driven NPC/faction AI - RimWorld-like combat system -
AI-generated world + content (Codex validation loop) - ASCII/glyph
rendering layer (interchangeable later with sprites)

------------------------------------------------------------------------

## 2. Architecture

Simulation-first architecture:

Presentation Layer (ASCII Renderer) ↓ Interaction Layer (CRPG controls)
↓ Simulation Core (world truth) ↓ AI Generation Layer (world +
validation)

------------------------------------------------------------------------

## 3. Core Systems

### 3.1 Cave Graph System

-   Node = cavern
-   Edge = tunnel
-   Dynamic modification: dig / collapse / seal
-   Graph-based navigation & visibility

### 3.2 Tick Engine

Each tick: 1. NPC decisions 2. Resource flow 3. Faction updates 4.
Combat resolution 5. Event triggers 6. Cave stability update

------------------------------------------------------------------------

### 3.3 NPC System

-   Traits-based personality
-   Belief-aligned behavior policy
-   Memory system
-   Decision(worldState) -\> action

------------------------------------------------------------------------

### 3.4 Faction System

-   BeliefSystem defines:
    -   allowed actions
    -   worldview
    -   social logic
-   Relations between factions dynamic

------------------------------------------------------------------------

### 3.5 Combat System (RimWorld-like)

-   Real-time with pause
-   Squad-based control (CRPG hybrid)
-   Cover + LOS based on graph topology
-   Tick-resolved actions

------------------------------------------------------------------------

## 4. AI Layer

### 4.1 Cave Generator

-   Generates graph world
-   Biomes + resource distribution

### 4.2 Faith Generator

-   Generates belief systems
-   Defines behavioral constraints

### 4.3 Event Generator

-   Uses world snapshot
-   Produces emergent events

### 4.4 Codex Simulation Validator

-   Runs N simulations
-   Evaluates:
    -   stability
    -   narrative richness
    -   playability

------------------------------------------------------------------------

## 5. Rendering System

ASCII-first design:

Entity -\> Glyph mapping: - NPC: @ - Wall: \# - Resource: \* - Faction
leaders: uppercase letters

States: - Fog of war - Opacity = knowledge level - Color =
faction/state - Blink = instability

------------------------------------------------------------------------

## 6. Data Model

Node: - id - resources - stability - occupants - visibility

Edge: - state (open/blocked/collapsed) - traversal cost

NPC: - traits - belief alignment - memory - decision policy

Faction: - belief system - resources - relations

------------------------------------------------------------------------

## 7. Save System

-   Full graph snapshot
-   NPC states
-   faction states
-   event history log

------------------------------------------------------------------------

## 8. Performance

-   Chunked graph loading
-   Tick batching
-   Simulation decoupled from rendering
