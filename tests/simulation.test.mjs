import test from "node:test";
import assert from "node:assert/strict";
import { initialState, applyEvent } from "../src/simulation.js";

test("a compatible demonstration writes bounded temporary memory", () => {
  const next = applyEvent(initialState(), { type: "DEMONSTRATE" });
  assert.equal(next.memoryStrength, 0.32);
  assert.equal(next.demonstrations, 1);
  assert.equal(next.phase, "Encoding");
});

test("compatible repetition improves recall", () => {
  let state = initialState();
  state = applyEvent(state, { type: "DEMONSTRATE" });
  state = applyEvent(state, { type: "DEMONSTRATE" });
  state = applyEvent(state, { type: "TEST" });
  assert.equal(state.phase, "Recalled");
  assert.ok(state.memoryStrength > state.interference);
});

test("a competing write produces uncertainty after one example", () => {
  let state = applyEvent(initialState(), { type: "DEMONSTRATE" });
  state = applyEvent(state, { type: "CONFLICT" });
  state = applyEvent(state, { type: "TEST" });
  assert.equal(state.phase, "Uncertain");
});

test("retention control and strength remain within declared ranges", () => {
  let state = applyEvent(initialState(), { type: "SET_DECAY", value: 0.5 });
  for (let index = 0; index < 20; index += 1) state = applyEvent(state, { type: "DEMONSTRATE" });
  assert.equal(state.decay, 0.5);
  assert.ok(state.memoryStrength >= 0 && state.memoryStrength <= 1);
  assert.ok(state.interference >= 0 && state.interference <= 1);
});

