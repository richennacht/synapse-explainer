"use client";

import { useState } from "react";
import ArchitectureViz from "../components/ArchitectureViz";
import TemporalLab from "../components/TemporalLab";
import { runTemporalMemory } from "../lib/temporal";

const parts=[
 {id:"basics",number:"PART 1",title:"Why connections change",short:"Basics"},
 {id:"model",number:"PART 2",title:"Put memory inside a small model",short:"Small model"},
 {id:"bdh",number:"PART 3",title:"Find the mechanism inside BDH",short:"BDH"}
];

export default function Page(){
 const [part,setPart]=useState("basics");
 const [coactivity,setCoactivity]=useState(2),[cue,setCue]=useState("north"),[repetitions,setRepetitions]=useState(2),[plasticity,setPlasticity]=useState(.35),[retention,setRetention]=useState(.9);
 const model={cue,repetitions,plasticity,retention}; const result=runTemporalMemory(model);
 return <>
  <header className="chapter-bar"><a className="wordmark" href="#top">Synapse Explainer</a><div className="part-tabs" role="tablist" aria-label="Learning chapters">{parts.map(p=><button key={p.id} id={`${p.id}-tab`} role="tab" aria-selected={part===p.id} aria-controls={`${p.id}-panel`} onClick={()=>{setPart(p.id);scrollTo({top:0,behavior:"smooth"})}}><small>{p.number}</small><span>{p.short}</span></button>)}</div></header>
  <main className="chapter-main" id="top">
   <article id="basics-panel" role="tabpanel" aria-labelledby="basics-tab" hidden={part!=="basics"}><Intro number="Part one of three" title="A connection can remember what just happened" lead="Begin with two neurons. See activity change one connection, then give that changing connection a name."/>
    <section><span className="number">01</span><h2>Signals travel between neurons</h2><p>A neuron receives signals, combines them, and may send a new signal onward. The junction between two neurons is called a synapse. Its strength controls how much influence the first neuron has on the second.</p><div className="two-neuron-demo"><div className="neuron active">1.0<span>sender</span></div><div className="synapse-line" style={{height:2+coactivity*2}}><b>{(.2+coactivity*.12).toFixed(2)}</b></div><div className="neuron active">1.0<span>receiver</span></div></div></section>
    <section><span className="number">02</span><h2>Repeated activity leaves a temporary trace</h2><p>When the same two neurons activate together, we can strengthen their connection. This ability to change is synaptic plasticity. Move the control and watch one concrete connection change.</p><Control label="Times active together" value={coactivity} min={0} max={6} step={1} set={setCoactivity}/><div className="plain-calculation"><span>starting strength</span><b>0.20</b><span>+</span><span>{coactivity} repeats × 0.12</span><span>=</span><strong>{(.2+coactivity*.12).toFixed(2)}</strong></div></section>
    <section><span className="number">03</span><h2>Hebbian is the update rule</h2><p>The term “Hebbian learning” refers to this local instruction: when a sender and receiver are active together, strengthen their connection. Plasticity says a connection can change. The Hebbian rule says when and where to change it.</p><Next onClick={()=>setPart("model")}>Continue to the small model</Next></section>
   </article>

   <article id="model-panel" role="tabpanel" aria-labelledby="model-tab" hidden={part!=="model"}><Intro number="Part two of three" title="A complete model small enough to inspect" lead="Follow a short sensor sequence through every neuron, memory cell, and output calculation."/>
    <section><span className="number">01</span><h2>A decision can depend on an earlier signal</h2><p>This provisional model is an intersection teaching simulation. A sensor detects an approaching vehicle, the view is briefly blocked, and the controller must retain the direction until it chooses a phase. The example can be replaced without changing the chapter structure.</p><label className="choice-control"><span>Earlier sensor event</span><select value={cue} onChange={e=>setCue(e.target.value)}><option value="north">North approach</option><option value="east">East approach</option></select></label><TemporalLab {...model} view="timeline"/></section>
    <section><span className="number">02</span><h2>Every activation remains visible</h2><p>Three inputs feed three internal units and two possible outputs. The diagram shows the exact activation in every circle.</p><TemporalLab {...model} view="network"/></section>
    <section><span className="number">03</span><h2>The model writes and reads temporary memory</h2><p>The four-cell matrix H stores the recent direction-to-action association. Repetition controls how many times it is written. Plasticity controls the size of each write. Retention controls how much survives.</p><TemporalLab {...model} view="matrix"/><div className="control-pair"><Control label="Repeated observation" value={repetitions} min={0} max={6} step={1} set={setRepetitions}/><Control label="Plasticity" value={plasticity} min={0} max={1} step={.05} set={setPlasticity}/></div><TemporalLab {...model} view="recall"/><Control label="Retention" value={retention} min={.5} max={1} step={.05} set={setRetention}/><p className="annotation" aria-live="polite">Visible output: [{result.output.join(", ")}], selecting <b>{result.decision}</b>.</p><Next onClick={()=>setPart("bdh")}>Continue to BDH</Next></section>
   </article>

   <article id="bdh-panel" role="tabpanel" aria-labelledby="bdh-tab" hidden={part!=="bdh"}><Intro number="Part three of three" title="How Dragon Hatchling uses changing synapses" lead="Connect the small calculation to the architecture required by the hackathon, while keeping the evidence boundary visible."/>
    <section><span className="number">01</span><h2>BDH is a graph, not a Transformer stack</h2><p>Dragon Hatchling is described as a scale-free network of locally interacting neuron particles. Some neurons act as highly connected hubs while many communicate within smaller neighborhoods.</p><ArchitectureViz mode="bdh" value={result.H.flat().reduce((a,b)=>a+b,0)} label="Teaching-scale view of BDH-style local interactions"/></section>
    <section><span className="number">02</span><h2>Its working state changes during inference</h2><p>In the paper’s brain interpretation, sparse positive neuron activity produces spikes. Recent activity changes selected synaptic connections through Hebbian learning. Those changing connections carry working memory while the model processes a sequence.</p><div className="bdh-bridge"><div><small>SMALL MODEL</small><b>H is a visible 2 × 2 matrix</b></div><span>same teaching idea</span><div><small>BDH</small><b>Plastic state spans a learned interaction network</b></div></div></section>
    <section><span className="number">03</span><h2>What this explainer proves, and what it does not</h2><p>Parts one and two prove how our deterministic teaching equations behave. This chapter explains how those ideas relate to BDH. It does not claim that the tiny model reproduces trained BDH weights, language performance, or biological realism.</p><p className="sources"><a href="https://arxiv.org/abs/2509.26507">Dragon Hatchling paper</a> · <a href="https://github.com/pathwaycom/bdh">Official implementation</a></p><Next onClick={()=>setPart("basics")}>Return to the beginning</Next></section>
   </article>
  </main>
 </>;
}

function Intro({number,title,lead}){return <header className="chapter-intro"><time>{number}</time><h1>{title}</h1><p className="lead">{lead}</p></header>}
function Control({label,value,min,max,step,set}){return <label className="single-control"><span>{label}</span><output>{step<1?Number(value).toFixed(2):value}</output><input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={e=>set(Number(e.target.value))}/></label>}
function Next({children,onClick}){return <button className="next-part" onClick={()=>{onClick();scrollTo({top:0,behavior:"smooth"})}}>{children}<span>→</span></button>}

