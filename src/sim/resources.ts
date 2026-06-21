import { appendSimulationEvent } from "./events.js";
import { RESOURCE_KEYS, type ResourceKey, type WorldSnapshot } from "./types.js";

export interface ResourceFlowOptions {
  resourceFlowRate: number;
}

export interface ResourceTransfer {
  edgeId: string;
  resource: ResourceKey;
  fromNodeId: string;
  toNodeId: string;
  amount: number;
}

export interface ResourceFlowResult {
  world: WorldSnapshot;
  transfers: ResourceTransfer[];
}

export function applyResourceFlow(
  world: WorldSnapshot,
  options: ResourceFlowOptions,
): ResourceFlowResult {
  const nodeById = new Map(
    world.nodes.map((node) => [
      node.id,
      { ...node, resources: { ...node.resources } },
    ]),
  );
  const transfers: ResourceTransfer[] = [];

  for (const edge of world.edges) {
    if (edge.state !== "open") {
      continue;
    }

    const fromNode = nodeById.get(edge.from);
    const toNode = nodeById.get(edge.to);

    if (!fromNode || !toNode) {
      continue;
    }

    for (const resource of RESOURCE_KEYS) {
      const fromAmount = fromNode.resources[resource];
      const toAmount = toNode.resources[resource];
      const difference = fromAmount - toAmount;
      const amount = Math.floor(
        Math.abs(difference) * options.resourceFlowRate / edge.traversalCost,
      );

      if (amount <= 0) {
        continue;
      }

      const source = difference > 0 ? fromNode : toNode;
      const target = difference > 0 ? toNode : fromNode;
      const safeAmount = Math.min(amount, source.resources[resource]);

      if (safeAmount <= 0) {
        continue;
      }

      source.resources[resource] -= safeAmount;
      target.resources[resource] += safeAmount;
      transfers.push({
        edgeId: edge.id,
        resource,
        fromNodeId: source.id,
        toNodeId: target.id,
        amount: safeAmount,
      });
    }
  }

  const flowedWorld = {
    ...world,
    nodes: world.nodes.map((node) => {
      const updatedNode = nodeById.get(node.id);
      return updatedNode ?? node;
    }),
  };

  if (transfers.length === 0) {
    return { world: flowedWorld, transfers };
  }

  return {
    world: appendSimulationEvent(flowedWorld, {
      type: "resource",
      message: summarizeResourceTransfers(transfers),
      edgeIds: Array.from(new Set(transfers.map((transfer) => transfer.edgeId))),
      nodeIds: Array.from(
        new Set(
          transfers.flatMap((transfer) => [
            transfer.fromNodeId,
            transfer.toNodeId,
          ]),
        ),
      ),
    }),
    transfers,
  };
}

function summarizeResourceTransfers(transfers: ResourceTransfer[]): string {
  const totalAmount = transfers.reduce(
    (sum, transfer) => sum + transfer.amount,
    0,
  );

  return `${transfers.length} resource transfers moved ${totalAmount} units.`;
}
