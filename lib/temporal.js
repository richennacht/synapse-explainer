export const round = value => Math.round(value * 100) / 100;

export function runTemporalMemory({ cue = "north", repetitions = 2, plasticity = .35, retention = .9 }) {
  const input = cue === "north" ? [1, 0, 0] : [0, 1, 0];
  const hidden = [input[0], input[1], round(.2 * (input[0] + input[1]))];
  const target = cue === "north" ? [1, 0] : [0, 1];
  let H = [[0, 0], [0, 0]];
  const writes = [];
  for (let step = 0; step < repetitions; step += 1) {
    H = H.map((row, i) => row.map((old, j) => round(retention * old + plasticity * hidden[i] * target[j])));
    writes.push(H.map(row => [...row]));
  }
  const goInput = [0, 0, 1];
  const readCue = hidden.slice(0, 2);
  const output = [
    round(readCue[0] * H[0][0] + readCue[1] * H[1][0]),
    round(readCue[0] * H[0][1] + readCue[1] * H[1][1])
  ];
  return { input, hidden, target, H, writes, goInput, output, decision: output[0] >= output[1] ? "NORTH PHASE" : "EAST PHASE" };
}

