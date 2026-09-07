export const initialState = () => ({
  phase: "Idle",
  demonstrations: 0,
  memoryStrength: 0,
  interference: 0,
  decay: 0.86,
  history: [{ step: 0, strength: 0, interference: 0 }]
});

export function applyEvent(state, event) {
  const next = structuredClone(state);

  if (event.type === "SET_DECAY") next.decay = event.value;

  if (event.type === "DEMONSTRATE") {
    next.phase = "Encoding";
    next.demonstrations += 1;
    next.memoryStrength = Math.min(1, next.memoryStrength * next.decay + 0.32);
    next.interference *= next.decay;
  }

  if (event.type === "CONFLICT") {
    next.phase = "Interference";
    next.demonstrations += 1;
    next.memoryStrength *= 0.72;
    next.interference = Math.min(1, next.interference + 0.42);
  }

  if (event.type === "TEST") next.phase = next.memoryStrength > next.interference ? "Recalled" : "Uncertain";

  if (["DEMONSTRATE", "CONFLICT", "TEST"].includes(event.type)) {
    next.history.push({
      step: next.history.length,
      strength: next.memoryStrength,
      interference: next.interference
    });
  }

  return next;
}

