import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { seedScenario } from "../data/seedScenario.js";
import { getOpenNeighborIds, summarizeWorld } from "../sim/world.js";

describe("seed scenario world helpers", () => {
  it("summarizes the authored debug scenario", () => {
    assert.deepEqual(summarizeWorld(seedScenario), {
      nodeCount: 4,
      edgeCount: 3,
      visibleNodeCount: 3,
      openEdgeCount: 2,
      factionCount: 3,
    });
  });

  it("only treats open edges as traversable neighbors", () => {
    assert.deepEqual(getOpenNeighborIds(seedScenario.edges, "spore-market"), [
      "rootwell",
    ]);
  });
});
