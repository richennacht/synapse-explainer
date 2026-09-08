import test from "node:test";
import assert from "node:assert/strict";
import { runTemporalMemory } from "../lib/temporal.js";

test("northbound detection writes and recalls the north phase", () => {
  const result = runTemporalMemory({ cue: "north", repetitions: 2, plasticity: .35, retention: .9 });
  assert.equal(result.decision, "NORTH PHASE");
  assert.ok(result.H[0][0] > 0);
  assert.equal(result.H[0][1], 0);
});

test("eastbound detection writes and recalls the east phase", () => {
  const result = runTemporalMemory({ cue: "east", repetitions: 3, plasticity: .2, retention: .8 });
  assert.equal(result.decision, "EAST PHASE");
  assert.ok(result.H[1][1] > 0);
  assert.equal(result.H[1][0], 0);
});

