import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { seedScenario } from "../data/seedScenario.js";
import { getOpenNeighborIds, summarizeWorld } from "../sim/world.js";
import { formatGraphOverview } from "../ui/debugView.js";

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

  it("uses explicit entity reference fields on cave nodes", () => {
    const rootwell = seedScenario.nodes.find((node) => node.id === "rootwell");

    assert.deepEqual(rootwell?.factionIds, ["strata-guild"]);
    assert.deepEqual(rootwell?.npcIds, []);
    assert.equal("occupants" in (rootwell ?? {}), false);
  });

  it("stores structured event records for the debug history", () => {
    assert.deepEqual(seedScenario.events[0], {
      id: "event.initial-survey",
      tick: 0,
      type: "survey",
      message: "Survey begins at Rootwell Atrium.",
      nodeIds: ["rootwell"],
    });
  });

  it("keeps edge stress data beside traversal data", () => {
    assert.equal(seedScenario.edges[2]?.stabilityStress, 9);
  });

  it("builds the debug graph overview from world edge data", () => {
    const changedWorld = {
      ...seedScenario,
      edges: seedScenario.edges.map((edge) =>
        edge.id === "spore-sealed" ? { ...edge, state: "open" as const } : edge,
      ),
    };

    assert.match(
      formatGraphOverview(changedWorld),
      /Sealed Vein \[open, cost 3, stress 9\]/,
    );
  });
});
