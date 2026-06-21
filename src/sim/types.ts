export type ResourceKey = "food" | "oxygen" | "heat";

export type ResourceStock = Record<ResourceKey, number>;

export type Visibility = "unknown" | "known" | "visited";

export type EdgeState = "open" | "blocked" | "collapsed";

export type SimulationEventType =
  | "survey"
  | "graph"
  | "resource"
  | "stability"
  | "collapse"
  | "warning"
  | "tick";

export interface CaveNode {
  id: string;
  name: string;
  resources: ResourceStock;
  stability: number;
  factionIds: string[];
  npcIds: string[];
  visibility: Visibility;
}

export interface CaveEdge {
  id: string;
  from: string;
  to: string;
  state: EdgeState;
  traversalCost: number;
  stabilityStress: number;
}

export interface Faction {
  id: string;
  name: string;
  belief: string;
  homeNodeId: string;
}

export interface WorldSnapshot {
  tick: number;
  seed: number;
  nodes: CaveNode[];
  edges: CaveEdge[];
  factions: Faction[];
  events: SimulationEvent[];
}

export interface SimulationEvent {
  id: string;
  tick: number;
  type: SimulationEventType;
  message: string;
  nodeIds?: string[];
  edgeIds?: string[];
  factionIds?: string[];
}
