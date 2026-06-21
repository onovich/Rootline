import type { CaveEdge, CaveNode, WorldSnapshot } from "./types.js";

export interface WorldSummary {
  nodeCount: number;
  edgeCount: number;
  visibleNodeCount: number;
  openEdgeCount: number;
  factionCount: number;
}

export function summarizeWorld(world: WorldSnapshot): WorldSummary {
  return {
    nodeCount: world.nodes.length,
    edgeCount: world.edges.length,
    visibleNodeCount: getVisibleNodes(world).length,
    openEdgeCount: world.edges.filter((edge) => edge.state === "open").length,
    factionCount: world.factions.length,
  };
}

export function getVisibleNodes(world: WorldSnapshot): CaveNode[] {
  return world.nodes.filter((node) => node.visibility !== "unknown");
}

export function getOpenNeighbors(
  world: WorldSnapshot,
  nodeId: string,
): CaveNode[] {
  const neighborIds = getOpenNeighborIds(world.edges, nodeId);
  return world.nodes.filter((node) => neighborIds.includes(node.id));
}

export function getOpenNeighborIds(edges: CaveEdge[], nodeId: string): string[] {
  return edges
    .filter((edge) => edge.state === "open")
    .flatMap((edge) => {
      if (edge.from === nodeId) {
        return [edge.to];
      }

      if (edge.to === nodeId) {
        return [edge.from];
      }

      return [];
    });
}
