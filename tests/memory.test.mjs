import test from "node:test";
import assert from "node:assert/strict";
import { compareMemory, plasticTrace } from "../lib/memory.js";

test("repetition strengthens a bounded plastic trace", () => {
  const once = plasticTrace({ repetitions: 1, plasticity: .35, decay: .9 });
  const repeated = plasticTrace({ repetitions: 5, plasticity: .35, decay: .9 });
  assert.ok(repeated > once);
  assert.ok(repeated <= 1);
});

test("KV storage grows while the plastic footprint stays fixed", () => {
  const short = compareMemory({ contextLength: 4, repetitions: 2, plasticity: .35, decay: .9 });
  const long = compareMemory({ contextLength: 24, repetitions: 2, plasticity: .35, decay: .9 });
  assert.equal(short.kvSlots, 4);
  assert.equal(long.kvSlots, 24);
  assert.equal(short.plasticSlots, long.plasticSlots);
  assert.equal(short.trace, long.trace);
});

