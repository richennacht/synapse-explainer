"use client";

import {useMemo,useState} from "react";

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

export function HebbianFigure(){
 const [repeats,setRepeats]=useState(3),eta=.12;
 const pre=[1,.65,.15],post=[.9,.35,.1];
 const matrix=post.map(y=>pre.map(x=>eta*repeats*x*y));
 return <figure className="learning-figure hebbian-figure"><FigureTitle title="One shared firing pattern writes a matrix" text="Increase repeated co-activation. Every cell is the Hebbian update ηxyᵀ, not a decorative heatmap."/>
  <div className="hebbian-layout"><svg viewBox="0 0 310 250" role="img" aria-label="Three input neurons connect to three output neurons with connection widths proportional to Hebbian strengthening">
   {pre.map((v,i)=>post.map((u,j)=><line key={`${i}-${j}`} x1="62" y1={52+i*72} x2="248" y2={52+j*72} strokeWidth={1+matrix[j][i]*10} opacity={.18+matrix[j][i]}/ >))}
   {pre.map((v,i)=><g key={i}><circle cx="48" cy={52+i*72} r={13+v*7}/><text x="48" y={57+i*72} textAnchor="middle">{v.toFixed(2)}</text></g>)}
   {post.map((v,i)=><g key={i}><circle cx="262" cy={52+i*72} r={13+v*7}/><text x="262" y={57+i*72} textAnchor="middle">{v.toFixed(2)}</text></g>)}
   <text className="figure-label" x="48" y="242" textAnchor="middle">x · before</text><text className="figure-label" x="262" y="242" textAnchor="middle">y · after</text>
  </svg><div><div className="matrix-grid" aria-label="Hebbian weight update matrix">{matrix.flat().map((v,i)=><span key={i} style={{opacity:.22+v/.45}}>{v.toFixed(2)}</span>)}</div><small>ΔW after {repeats} paired firing events</small></div></div>
  <label className="figure-control"><span>Paired firing events <output>{repeats}</output></span><input aria-label="Paired firing events" type="range" min="0" max="6" value={repeats} onChange={e=>setRepeats(+e.target.value)}/></label>
 </figure>
}

export function OjaFigure(){
 const [steps,setSteps]=useState(34); const points=useMemo(()=>Array.from({length:61},(_,i)=>({i,hebb:.16+i*.032,oja:1.02-(1.02-.16)*Math.exp(-i/12)})),[]);
 const W=720,H=310,x=i=>54+i/60*630,y=v=>28+(2.1-v)/2.1*225,path=key=>points.slice(0,steps+1).map((p,i)=>`${i?"L":"M"}${x(p.i)},${y(p[key])}`).join(" ");
 return <figure className="learning-figure"><FigureTitle title="Oja’s rule prevents runaway growth" text="The same repeated input drives pure Hebbian weights upward. Oja’s normalization makes the weight settle."/><svg className="line-figure" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Pure Hebbian weight grows without bound while Oja weight stabilizes">
   <line className="axis" x1="54" y1={y(0)} x2="684" y2={y(0)}/><line className="axis" x1="54" y1="28" x2="54" y2={y(0)}/><line className="limit" x1="54" y1={y(1)} x2="684" y2={y(1)}/><text x="676" y={y(1)-8} textAnchor="end">stable scale</text>
   <path className="series-primary" d={path("hebb")}/><path className="series-secondary" d={path("oja")}/><circle cx={x(steps)} cy={y(points[steps].hebb)} r="5"/><circle className="secondary-point" cx={x(steps)} cy={y(points[steps].oja)} r="5"/>
   <text className="direct-label" x={x(steps)-8} y={y(points[steps].hebb)-12} textAnchor="end">Hebbian {points[steps].hebb.toFixed(2)}</text><text className="direct-label" x={x(steps)-8} y={y(points[steps].oja)+20} textAnchor="end">Oja {points[steps].oja.toFixed(2)}</text><text className="axis-title" x="370" y="298" textAnchor="middle">repeated updates</text><text className="axis-title" transform="translate(16 145) rotate(-90)" textAnchor="middle">weight magnitude</text>
  </svg><label className="figure-control"><span>Updates shown <output>{steps}</output></span><input aria-label="Updates shown" type="range" min="1" max="60" value={steps} onChange={e=>setSteps(+e.target.value)}/></label></figure>
}

export function FastSlowFigure(){
 const [recency,setRecency]=useState(4); const fast=clamp(recency/6,0,1),answer=.18+.72*fast;
 return <figure className="learning-figure"><FigureTitle title="One small model, two timescales" text="Slow weights preserve the learned skill. Fast weights temporarily bias the same model toward a recent association."/>
  <div className="timescale-model" role="img" aria-label={`A frozen three-layer model plus a temporary memory path with strength ${fast.toFixed(2)}`}><div className="model-input"><small>prompt</small><b>Sector K → ?</b></div><div className="mini-network">{[0,1,2].map(layer=><div key={layer}>{[0,1,2,3].map(node=><i key={node}/>)}</div>)}</div><div className="model-output"><small>next token</small><b>LUMEN</b><span style={{width:`${answer*100}%`}}/></div><div className="slow-path"><small>slow weights</small><b>language skill</b></div><div className="fast-path" style={{opacity:.2+.8*fast}}><small>fast weights</small><b>recent cue → answer</b></div></div>
  <label className="figure-control"><span>Recent association strength <output>{fast.toFixed(2)}</output></span><input aria-label="Recent association strength" type="range" min="0" max="6" value={recency} onChange={e=>setRecency(+e.target.value)}/></label><p className="figure-result">Probability assigned to “LUMEN” <b>{Math.round(answer*100)}%</b></p>
 </figure>
}

function FigureTitle({title,text}){return <figcaption><b>{title}</b><span>{text}</span></figcaption>}

