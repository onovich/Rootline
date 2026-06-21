import type {
  SimulationEvent,
  SimulationEventType,
  WorldSnapshot,
} from "./types.js";

export interface EventInput {
  type: SimulationEventType;
  message: string;
  nodeIds?: string[];
  edgeIds?: string[];
  factionIds?: string[];
}

export function createSimulationEvent(
  world: WorldSnapshot,
  input: EventInput,
): SimulationEvent {
  return {
    id: `event.${world.tick}.${input.type}.${world.events.length + 1}`,
    tick: world.tick,
    type: input.type,
    message: input.message,
    nodeIds: input.nodeIds,
    edgeIds: input.edgeIds,
    factionIds: input.factionIds,
  };
}

export function appendSimulationEvent(
  world: WorldSnapshot,
  input: EventInput,
): WorldSnapshot {
  return {
    ...world,
    events: [...world.events, createSimulationEvent(world, input)],
  };
}
