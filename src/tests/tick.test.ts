import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { seedScenario } from "../data/seedScenario.js";
import { advanceTick, resolveTickOptions } from "../sim/tick.js";

describe("tick shell", () => {
  it("resolves default tick options from one central place", () => {
    assert.deepEqual(resolveTickOptions({ collapseThreshold: 10 }), {
      resourceFlowRate: 0.25,
      stabilityStressRate: 1,
      collapseThreshold: 10,
    });
  });

  it("advances tick, rng state, and event history without mutating input", () => {
    const nextWorld = advanceTick(seedScenario);

    assert.equal(seedScenario.tick, 0);
    assert.equal(nextWorld.tick, 1);
    assert.equal(nextWorld.rngState, 3539251108);
    assert.equal(nextWorld.events.at(-1)?.type, "tick");
    assert.equal(nextWorld.events.at(-1)?.id, "event.1.tick.4");
  });

  it("replays deterministically from the same seed scenario", () => {
    const replayA = advanceTick(advanceTick(seedScenario));
    const replayB = advanceTick(advanceTick(seedScenario));

    assert.deepEqual(replayA, replayB);
  });
});
