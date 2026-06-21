import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { seedScenario } from "../data/seedScenario.js";
import { applyGraphCommand, validateWorldGraph } from "../sim/graph.js";
import { getOpenNeighborIds } from "../sim/world.js";

describe("cave graph validation and commands", () => {
  it("accepts the authored seed scenario as a valid graph", () => {
    assert.deepEqual(validateWorldGraph(seedScenario), {
      valid: true,
      errors: [],
      warnings: [],
    });
  });

  it("reports missing edge endpoints as validation errors", () => {
    const invalidWorld = {
      ...seedScenario,
      edges: [
        ...seedScenario.edges,
        {
          id: "bad-edge",
          from: "rootwell",
          to: "missing-node",
          state: "open" as const,
          traversalCost: 1,
          stabilityStress: 1,
        },
      ],
    };

    assert.deepEqual(validateWorldGraph(invalidWorld), {
      valid: false,
      errors: ["Edge bad-edge references missing to node missing-node."],
      warnings: [],
    });
  });

  it("opens a blocked edge and records a graph event", () => {
    const nextWorld = applyGraphCommand(seedScenario, {
      type: "open-edge",
      edgeId: "spore-sealed",
    });

    assert.equal(
      nextWorld.edges.find((edge) => edge.id === "spore-sealed")?.state,
      "open",
    );
    assert.deepEqual(getOpenNeighborIds(nextWorld.edges, "spore-market"), [
      "rootwell",
      "sealed-vein",
    ]);
    assert.deepEqual(nextWorld.events.at(-1), {
      id: "event.0.graph.3",
      tick: 0,
      type: "graph",
      message: "Edge spore-sealed changed from blocked to open.",
      edgeIds: ["spore-sealed"],
      nodeIds: ["spore-market", "sealed-vein"],
      factionIds: undefined,
    });
  });

  it("blocks an open edge and removes it from traversable neighbors", () => {
    const nextWorld = applyGraphCommand(seedScenario, {
      type: "block-edge",
      edgeId: "rootwell-echo",
    });

    assert.equal(
      nextWorld.edges.find((edge) => edge.id === "rootwell-echo")?.state,
      "blocked",
    );
    assert.deepEqual(getOpenNeighborIds(nextWorld.edges, "rootwell"), [
      "spore-market",
    ]);
  });

  it("collapses an edge and records a collapse event", () => {
    const nextWorld = applyGraphCommand(seedScenario, {
      type: "collapse-edge",
      edgeId: "rootwell-spore",
      reason: "stress test",
    });

    assert.equal(
      nextWorld.edges.find((edge) => edge.id === "rootwell-spore")?.state,
      "collapsed",
    );
    assert.equal(nextWorld.events.at(-1)?.type, "collapse");
    assert.deepEqual(getOpenNeighborIds(nextWorld.edges, "rootwell"), [
      "echo-vault",
    ]);
  });

  it("keeps graph state unchanged and records a warning for invalid commands", () => {
    const nextWorld = applyGraphCommand(seedScenario, {
      type: "open-edge",
      edgeId: "rootwell-echo",
    });

    assert.deepEqual(nextWorld.edges, seedScenario.edges);
    assert.equal(nextWorld.events.at(-1)?.type, "warning");
    assert.equal(
      nextWorld.events.at(-1)?.message,
      "Cannot change edge rootwell-echo from open to open.",
    );
  });
});
