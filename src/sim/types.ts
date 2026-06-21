export type ResourceKey = "food" | "oxygen" | "heat";

export type ResourceStock = Record<ResourceKey, number>;

export type Visibility = "unknown" | "known" | "visited";

export type EdgeState = "open" | "blocked" | "collapsed";

export interface CaveNode {
  id: string;
  name: string;
  resources: ResourceStock;
  stability: number;
  occupants: string[];
  visibility: Visibility;
}

export interface CaveEdge {
  id: string;
  from: string;
  to: string;
  state: EdgeState;
  traversalCost: number;
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
  events: string[];
}
