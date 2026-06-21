import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { seedScenario } from "../data/seedScenario.js";
import { applyGraphCommand } from "../sim/graph.js";
import { applyResourceFlow } from "../sim/resources.js";
import { advanceTick } from "../sim/tick.js";
import type { CaveEdge, WorldSnapshot } from "../sim/types.js";

describe("resource flow", () => {
  it("moves resources across open edges from high stock to low stock", () => {
    const result = applyResourceFlow(seedScenario, { resourceFlowRate: 0.25 });

    assert.equal(nodeResource(result.world, "rootwell", "food"), 40);
    assert.equal(nodeResource(result.world, "echo-vault", "food"), 24);
    assert.equal(nodeResource(result.world, "spore-market", "food"), 71);
    assert.equal(result.transfers.length, 5);
    assert.equal(result.world.events.at(-1)?.type, "resource");
  });

  it("does not move resources through blocked or collapsed edges", () => {
    const collapsedWorld = applyGraphCommand(seedScenario, {
      type: "collapse-edge",
      edgeId: "rootwell-spore",
      reason: "test collapse",
    });
    const result = applyResourceFlow(collapsedWorld, { resourceFlowRate: 1 });

    assert.equal(nodeResource(result.world, "spore-market", "food"), 75);
    assert.equal(nodeResource(result.world, "sealed-vein", "food"), 9);
    assert.deepEqual(
      result.transfers.map((transfer) => transfer.edgeId),
      ["rootwell-echo", "rootwell-echo", "rootwell-echo"],
    );
  });

  it("uses traversal cost to slow transfer amounts", () => {
    const slowWorld = withEdges(seedScenario, [
      {
        id: "rootwell-spore",
        traversalCost: 6,
      },
    ]);
    const fastResult = applyResourceFlow(seedScenario, { resourceFlowRate: 0.25 });
    const slowResult = applyResourceFlow(slowWorld, { resourceFlowRate: 0.25 });

    assert.equal(
      transferAmount(fastResult.transfers, "rootwell-spore", "food"),
      4,
    );
    assert.equal(
      transferAmount(slowResult.transfers, "rootwell-spore", "food"),
      1,
    );
  });

  it("keeps resource values finite and non-negative", () => {
    const result = applyResourceFlow(seedScenario, { resourceFlowRate: 8 });

    for (const node of result.world.nodes) {
      for (const amount of Object.values(node.resources)) {
        assert.equal(Number.isFinite(amount), true);
        assert.equal(amount >= 0, true);
      }
    }
  });

  it("integrates resource flow into deterministic tick replay", () => {
    const replayA = advanceTick(advanceTick(seedScenario));
    const replayB = advanceTick(advanceTick(seedScenario));

    assert.deepEqual(replayA, replayB);
    assert.equal(replayA.events.some((event) => event.type === "resource"), true);
  });
});

function nodeResource(
  world: WorldSnapshot,
  nodeId: string,
  resource: keyof WorldSnapshot["nodes"][number]["resources"],
): number {
  const node = world.nodes.find((candidate) => candidate.id === nodeId);
  assert.ok(node, `Expected node ${nodeId} to exist.`);
  return node.resources[resource];
}

function transferAmount(
  transfers: Array<{ edgeId: string; resource: string; amount: number }>,
  edgeId: string,
  resource: string,
): number {
  return (
    transfers.find(
      (transfer) =>
        transfer.edgeId === edgeId && transfer.resource === resource,
    )?.amount ?? 0
  );
}

function withEdges(
  world: WorldSnapshot,
  edgePatches: Array<Partial<CaveEdge> & { id: string }>,
): WorldSnapshot {
  return {
    ...world,
    edges: world.edges.map((edge) => ({
      ...edge,
      ...edgePatches.find((patch) => patch.id === edge.id),
    })),
  };
}
