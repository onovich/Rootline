import { appendSimulationEvent } from "./events.js";
import type { CaveEdge, WorldSnapshot } from "./types.js";

export type GraphCommand =
  | { type: "open-edge"; edgeId: string }
  | { type: "block-edge"; edgeId: string }
  | { type: "collapse-edge"; edgeId: string; reason: string };

export interface GraphValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateWorldGraph(
  world: WorldSnapshot,
): GraphValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const nodeIds = new Set<string>();
  const edgeIds = new Set<string>();
  const factionIds = new Set(world.factions.map((faction) => faction.id));

  for (const node of world.nodes) {
    if (nodeIds.has(node.id)) {
      errors.push(`Duplicate node id: ${node.id}`);
    }
    nodeIds.add(node.id);

    if (node.stability < 0 || node.stability > 100) {
      warnings.push(`Node ${node.id} stability is outside 0-100.`);
    }

    for (const factionId of node.factionIds) {
      if (!factionIds.has(factionId)) {
        errors.push(`Node ${node.id} references missing faction ${factionId}.`);
      }
    }
  }

  for (const edge of world.edges) {
    if (edgeIds.has(edge.id)) {
      errors.push(`Duplicate edge id: ${edge.id}`);
    }
    edgeIds.add(edge.id);

    if (!nodeIds.has(edge.from)) {
      errors.push(`Edge ${edge.id} references missing from node ${edge.from}.`);
    }

    if (!nodeIds.has(edge.to)) {
      errors.push(`Edge ${edge.id} references missing to node ${edge.to}.`);
    }

    if (edge.from === edge.to) {
      errors.push(`Edge ${edge.id} cannot connect a node to itself.`);
    }

    if (edge.traversalCost <= 0) {
      errors.push(`Edge ${edge.id} traversalCost must be positive.`);
    }

    if (edge.stabilityStress < 0) {
      errors.push(`Edge ${edge.id} stabilityStress cannot be negative.`);
    }
  }

  for (const faction of world.factions) {
    if (!nodeIds.has(faction.homeNodeId)) {
      errors.push(
        `Faction ${faction.id} references missing home node ${faction.homeNodeId}.`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function applyGraphCommand(
  world: WorldSnapshot,
  command: GraphCommand,
): WorldSnapshot {
  const edge = world.edges.find((candidate) => candidate.id === command.edgeId);

  if (!edge) {
    return warnGraphCommand(world, command.edgeId, "Target edge does not exist.");
  }

  switch (command.type) {
    case "open-edge":
      return applyEdgeStateTransition(world, edge, "blocked", "open");
    case "block-edge":
      return applyEdgeStateTransition(world, edge, "open", "blocked");
    case "collapse-edge":
      if (edge.state === "collapsed") {
        return warnGraphCommand(
          world,
          edge.id,
          "Collapsed edges cannot collapse again.",
        );
      }
      return updateEdgeState(
        world,
        edge,
        "collapsed",
        `Edge ${edge.id} collapsed: ${command.reason}`,
      );
  }
}

function applyEdgeStateTransition(
  world: WorldSnapshot,
  edge: CaveEdge,
  requiredState: CaveEdge["state"],
  nextState: CaveEdge["state"],
): WorldSnapshot {
  if (edge.state !== requiredState) {
    return warnGraphCommand(
      world,
      edge.id,
      `Cannot change edge ${edge.id} from ${edge.state} to ${nextState}.`,
    );
  }

  return updateEdgeState(
    world,
    edge,
    nextState,
    `Edge ${edge.id} changed from ${requiredState} to ${nextState}.`,
  );
}

function updateEdgeState(
  world: WorldSnapshot,
  edge: CaveEdge,
  nextState: CaveEdge["state"],
  message: string,
): WorldSnapshot {
  return appendSimulationEvent(
    {
      ...world,
      edges: world.edges.map((candidate) =>
        candidate.id === edge.id ? { ...candidate, state: nextState } : candidate,
      ),
    },
    {
      type: nextState === "collapsed" ? "collapse" : "graph",
      message,
      edgeIds: [edge.id],
      nodeIds: [edge.from, edge.to],
    },
  );
}

function warnGraphCommand(
  world: WorldSnapshot,
  edgeId: string,
  message: string,
): WorldSnapshot {
  return appendSimulationEvent(world, {
    type: "warning",
    message,
    edgeIds: [edgeId],
  });
}
