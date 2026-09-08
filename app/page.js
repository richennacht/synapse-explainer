"use client";

import { useMemo, useState } from "react";
import MemoryScene from "../components/MemoryScene";
import { compareMemory } from "../lib/memory";

const chapters = [
  ["motivation", "Why memory"], ["biology", "Plasticity"], ["hebbian", "Hebbian update"],
  ["compare", "Two memory systems"], ["limits", "Limits"], ["research", "Research"]
];

export default function Page() {
  const [contextLength, setContextLength] = useState(8);
  const [repetitions, setRepetitions] = useState(2);
  const [plasticity, setPlasticity] = useState(.35);
  const [decay, setDecay] = useState(.9);
  const state = useMemo(() => compareMemory({ contextLength, repetitions, plasticity, decay }), [contextLength, repetitions, plasticity, decay]);
  return <>
    <nav aria-label="Chapters">{chapters.map(([id, text]) => <a key={id} href={`#${id}`}><i />{text}</a>)}</nav>
    <main>
      <article>
        <header id="motivation"><time>September 8, 2026</time><h1>What if a network could remember by changing itself?</h1><p className="lead">A visual introduction to plastic connections, temporary memory, and why some AI researchers are looking beyond ever-growing context caches.</p></header>
        <section id="biology"><span className="number">01</span><h2>Plastic means changeable</h2><p>Neurons communicate across junctions called <strong>synapses</strong>. A synapse is not always a fixed-strength wire. Recent activity can make its next signal weaker or stronger.</p><p>This ability to change is called <strong>synaptic plasticity</strong>. “Plastic” does not mean artificial. It means the connection has some wiggle room. What just happened can change what the circuit does next.</p><p>Brains use many forms of plasticity, operating over different timescales. We will study one simple idea: when two units are active together, the connection between them can temporarily become stronger.</p></section>
        <section id="hebbian"><span className="number">02</span><h2>One experience leaves a trace</h2><p>Suppose an input unit and an output unit activate at the same time. We record that coincidence in a table of connection strengths. This table is the <strong>Hebbian matrix</strong>.</p><div className="equation"><span>new trace</span><b>=</b><span>old trace × retention</span><b>+</b><span>plasticity × input × output</span></div><p>The <strong>plasticity factor</strong> is simply a strength dial. At 0.1, each experience makes a small mark. At 0.8, one experience makes a much larger mark. The Hebbian rule is the update instruction that decides which cells receive that mark.</p></section>
        <section id="compare"><span className="number">03</span><h2>Two ways to remember a conversation</h2><p>A conventional Transformer usually keeps earlier information in a <strong>KV cache</strong>. Each processed token adds a key and a value. The list grows as the conversation grows.</p><p>A plastic network uses a different representation. It folds recent relationships into a changing internal matrix. The matrix stays the same physical size, but its values evolve.</p><div className="controls">
          <Control label="Context length" value={contextLength} min={2} max={24} step={1} set={setContextLength} />
          <Control label="Repeated experience" value={repetitions} min={0} max={6} step={1} set={setRepetitions} />
          <Control label="Plasticity factor" value={plasticity} min={0} max={1} step={.05} set={setPlasticity} />
          <Control label="Retention" value={decay} min={.5} max={1} step={.05} set={setDecay} />
        </div><div className="readout"><span>KV slots <b>{state.kvSlots}</b></span><span>Plastic cells <b>{state.plasticSlots}</b></span><span>Trace <b>{Math.round(state.trace * 100)}%</b></span></div></section>
        <section id="limits"><span className="number">04</span><h2>Fixed size does not mean unlimited memory</h2><p>The KV cache grows, but it preserves separate token-derived entries. The plastic matrix stays fixed, but new associations share the same cells. Eventually they can interfere with one another.</p><p>That is the trade-off to watch in the scene. Longer context adds visible KV slabs. Repetition strengthens selected matrix cells. Decay weakens them. Neither representation is automatically better for every task.</p></section>
        <section id="research"><span className="number">05</span><h2>Why researchers care now</h2><p>Fast-weight systems, linear attention, differentiable plasticity, and Dragon Hatchling all revisit the idea that a network can carry recent information in an evolving state rather than only in a growing token history.</p><p>Plastic networks have shown strong results on particular pattern-memory and adaptation tasks. BDH describes inference-time working memory through a synaptic-plasticity interpretation. These results motivate the experiment, but our scene remains a transparent teaching model rather than a reproduction of those systems.</p><p className="sources"><a href="https://arxiv.org/abs/2509.26507">Dragon Hatchling</a> · <a href="https://proceedings.mlr.press/v80/miconi18a.html">Differentiable plasticity</a> · <a href="https://arxiv.org/abs/2310.16076">Fast-weight programmers</a></p></section>
      </article>
      <aside><MemoryScene state={{ ...state, contextLength }} /><div className="scene-caption"><span>KV cache grows with context</span><span>Plastic state changes in place</span></div></aside>
    </main>
  </>;
}

function Control({ label, value, min, max, step, set }) {
  return <label><span>{label}</span><output>{Number(value).toFixed(step < 1 ? 2 : 0)}</output><input type="range" min={min} max={max} step={step} value={value} onChange={e => set(Number(e.target.value))} /></label>;
}

