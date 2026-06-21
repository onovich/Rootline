import type { WorldSnapshot } from "../sim/types.js";
import { createInitialRngState } from "../sim/rng.js";

export const seedScenario: WorldSnapshot = {
  tick: 0,
  seed: 104729,
  rngState: createInitialRngState(104729),
  nodes: [
    {
      id: "rootwell",
      name: "Rootwell Atrium",
      resources: { food: 42, oxygen: 68, heat: 55 },
      stability: 92,
      factionIds: ["strata-guild"],
      npcIds: [],
      visibility: "visited",
    },
    {
      id: "echo-vault",
      name: "Echo Vault",
      resources: { food: 18, oxygen: 48, heat: 41 },
      stability: 77,
      factionIds: ["echo-cult"],
      npcIds: [],
      visibility: "known",
    },
    {
      id: "spore-market",
      name: "Spore Market",
      resources: { food: 75, oxygen: 39, heat: 46 },
      stability: 64,
      factionIds: [],
      npcIds: [],
      visibility: "known",
    },
    {
      id: "sealed-vein",
      name: "Sealed Vein",
      resources: { food: 9, oxygen: 22, heat: 72 },
      stability: 35,
      factionIds: ["excavator-union"],
      npcIds: [],
      visibility: "unknown",
    },
  ],
  edges: [
    {
      id: "rootwell-echo",
      from: "rootwell",
      to: "echo-vault",
      state: "open",
      traversalCost: 1,
      stabilityStress: 4,
    },
    {
      id: "rootwell-spore",
      from: "rootwell",
      to: "spore-market",
      state: "open",
      traversalCost: 2,
      stabilityStress: 6,
    },
    {
      id: "spore-sealed",
      from: "spore-market",
      to: "sealed-vein",
      state: "blocked",
      traversalCost: 3,
      stabilityStress: 9,
    },
  ],
  factions: [
    {
      id: "echo-cult",
      name: "Echo Cult",
      belief: "Caves store memory; broken walls are wounded history.",
      homeNodeId: "echo-vault",
    },
    {
      id: "excavator-union",
      name: "Excavator Union",
      belief: "Expansion is survival, and sealed routes are slow death.",
      homeNodeId: "sealed-vein",
    },
    {
      id: "strata-guild",
      name: "Strata Guild",
      belief: "Stable stone is sacred; every tunnel must justify its stress.",
      homeNodeId: "rootwell",
    },
  ],
  events: [
    {
      id: "event.initial-survey",
      tick: 0,
      type: "survey",
      message: "Survey begins at Rootwell Atrium.",
      nodeIds: ["rootwell"],
    },
    {
      id: "event.initial-routes",
      tick: 0,
      type: "survey",
      message: "Two open routes are mapped; one unstable vein remains sealed.",
      edgeIds: ["rootwell-echo", "rootwell-spore", "spore-sealed"],
    },
  ],
};
