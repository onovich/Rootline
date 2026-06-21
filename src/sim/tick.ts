import { appendSimulationEvent } from "./events.js";
import { nextRngState } from "./rng.js";
import type { WorldSnapshot } from "./types.js";

export interface TickOptions {
  resourceFlowRate: number;
  stabilityStressRate: number;
  collapseThreshold: number;
}

export const DEFAULT_TICK_OPTIONS: TickOptions = {
  resourceFlowRate: 0.25,
  stabilityStressRate: 1,
  collapseThreshold: 25,
};

export function resolveTickOptions(
  options: Partial<TickOptions> = {},
): TickOptions {
  return {
    ...DEFAULT_TICK_OPTIONS,
    ...options,
  };
}

export function advanceTick(
  world: WorldSnapshot,
  options?: Partial<TickOptions>,
): WorldSnapshot {
  const tickOptions = resolveTickOptions(options);
  const nextTick = world.tick + 1;
  const tickingWorld = {
    ...world,
    tick: nextTick,
    rngState: nextRngState(world.rngState),
  };

  return appendSimulationEvent(tickingWorld, {
    type: "tick",
    message: `Tick ${nextTick} advanced with resource flow rate ${tickOptions.resourceFlowRate}.`,
  });
}
