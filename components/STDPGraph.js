"use client";

import {useState} from "react";

const W=720,H=360,pad={l:64,r:28,t:32,b:58};
const x=t=>pad.l+(t+60)/120*(W-pad.l-pad.r);
const y=v=>pad.t+(0.62-v)/1.24*(H-pad.t-pad.b);
const change=t=>t>0?Math.exp(-t/20):-0.72*Math.exp(t/20);
const curve=(from,to)=>Array.from({length:121},(_,i)=>{const t=from+(to-from)*i/120;return`${i?"L":"M"}${x(t).toFixed(1)},${y(change(t)).toFixed(1)}`}).join(" ");

export default function STDPGraph(){
 const [sample,setSample]=useState(12);
 const update=e=>{const box=e.currentTarget.getBoundingClientRect();setSample(Math.max(-60,Math.min(60,(e.clientX-box.left)/box.width*120-60)))};
 const value=change(sample),preFirst=sample>0;
 return <figure className="stdp-figure">
  <figcaption><b>The STDP learning window</b><span>Move across the plot to compare spike timing.</span></figcaption>
  <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="stdp-title stdp-desc" onPointerMove={update} onPointerDown={update}>
   <title id="stdp-title">Synaptic weight change by spike timing</title><desc id="stdp-desc">Positive time differences strengthen the connection. Negative time differences weaken it. Both effects decay toward zero as the interval grows.</desc>
   <line className="axis" x1={pad.l} y1={y(0)} x2={W-pad.r} y2={y(0)}/><line className="axis" x1={x(0)} y1={pad.t} x2={x(0)} y2={H-pad.b}/>
   {[-60,-40,-20,0,20,40,60].map(t=><g key={t}><line className="tick" x1={x(t)} y1={y(0)-4} x2={x(t)} y2={y(0)+4}/><text x={x(t)} y={H-31} textAnchor="middle">{t}</text></g>)}
   {[-.5,.5].map(v=><g key={v}><line className="tick" x1={pad.l-4} y1={y(v)} x2={pad.l+4} y2={y(v)}/><text x={pad.l-12} y={y(v)+4} textAnchor="end">{v>0?"+0.5":"−0.5"}</text></g>)}
   <path className="potentiation" d={curve(.01,60)}/><path className="depression" d={curve(-60,-.01)}/>
   <line className="guide" x1={x(sample)} y1={y(0)} x2={x(sample)} y2={y(value)}/><circle className={preFirst?"point positive":"point negative"} cx={x(sample)} cy={y(value)} r="6"/>
   <text className="region" x={x(30)} y={50} textAnchor="middle">pre before post · strengthen</text><text className="region" x={x(-30)} y={H-74} textAnchor="middle">post before pre · weaken</text>
   <text className="axis-title" x={(pad.l+W-pad.r)/2} y={H-8} textAnchor="middle">spike difference Δt (milliseconds)</text><text className="axis-title" transform={`translate(18 ${(pad.t+H-pad.b)/2}) rotate(-90)`} textAnchor="middle">weight change Δw</text>
  </svg>
  <p className="stdp-readout" aria-live="polite"><span>Δt <b>{sample.toFixed(1)} ms</b></span><span>Δw <b>{value>=0?"+":""}{value.toFixed(3)}</b></span><span><b>{preFirst?"Potentiation":"Depression"}</b></span></p>
 </figure>;
}

