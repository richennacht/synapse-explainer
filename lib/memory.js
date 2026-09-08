export const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

export function plasticTrace({ repetitions, plasticity, decay }) {
  let trace = 0;
  for (let i = 0; i < repetitions; i += 1) trace = decay * trace + plasticity * (1 - trace);
  return clamp(trace);
}

export function compareMemory({ contextLength, repetitions, plasticity, decay }) {
  const trace = plasticTrace({ repetitions, plasticity, decay });
  return {
    kvSlots: contextLength,
    plasticSlots: 64,
    trace,
    plasticConfidence: clamp(0.5 + trace * 0.48),
    kvConfidence: clamp(0.58 + Math.log2(contextLength + 1) * 0.045)
  };
}

