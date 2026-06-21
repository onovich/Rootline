const DEFAULT_NONZERO_SEED = 1;

export function createInitialRngState(seed: number): number {
  const state = seed >>> 0;
  return state === 0 ? DEFAULT_NONZERO_SEED : state;
}

export function nextRngState(state: number): number {
  return (Math.imul(1664525, state >>> 0) + 1013904223) >>> 0;
}

export function rngUnitFloat(state: number): {
  value: number;
  rngState: number;
} {
  const rngState = nextRngState(state);
  return {
    value: rngState / 0x100000000,
    rngState,
  };
}
