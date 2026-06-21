import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createInitialRngState,
  nextRngState,
  rngUnitFloat,
} from "../sim/rng.js";

describe("deterministic rng", () => {
  it("normalizes a zero seed to a nonzero state", () => {
    assert.equal(createInitialRngState(0), 1);
  });

  it("produces a stable state sequence", () => {
    const first = nextRngState(createInitialRngState(104729));
    const second = nextRngState(first);

    assert.equal(first, 3539251108);
    assert.equal(second, 2547726003);
  });

  it("returns deterministic unit values with the next state", () => {
    const sample = rngUnitFloat(createInitialRngState(7));

    assert.deepEqual(sample, {
      value: 1025555898 / 0x100000000,
      rngState: 1025555898,
    });
  });
});
