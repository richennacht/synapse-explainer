"use client";
import {useMemo,useState} from "react";
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const patterns={
 "vertical edge":{pre:[.95,.82,.18,.12],post:[.92,.62,.18]},
 "horizontal edge":{pre:[.18,.88,.86,.14],post:[.2,.9,.48]},
 "bright spot":{pre:[.14,.36,1,.2],post:[.12,.42,.96]}
};

export function HebbianFigure(){
 const [pattern,setPattern]=useState("vertical edge"),[repeats,setRepeats]=useState(3),[eta,setEta]=useState(.12);
 const {pre,post}=patterns[pattern],matrix=post.map(y=>pre.map(x=>eta*repeats*x*y)),names=["top","middle","lower","bias"],ys=(n,i)=>42+i*196/(n-1);
 return <figure className="learning-figure"><FigureTitle title="A firing pattern becomes a pathway" text="Choose a sensory pattern, then change how often it repeats and how plastic the synapses are. Edge darkness and width both encode the update; the matrix shows the same numbers directly."/>
  <div className="hebbian-toolbar"><label>Input pattern<select value={pattern} onChange={e=>setPattern(e.target.value)}>{Object.keys(patterns).map(p=><option key={p}>{p}</option>)}</select></label><span className="edge-key"><i/>larger Δw</span></div>
  <div className="hebbian-layout"><svg viewBox="0 0 430 280" role="img" aria-label={"Four input units connect to three feature units while learning a "+pattern}>
   {pre.flatMap((v,i)=>post.map((u,j)=>{const w=matrix[j][i],s=clamp(w/.36,0,1);return <line key={i+"-"+j} x1="104" y1={ys(4,i)} x2="326" y2={ys(3,j)} strokeWidth={.7+6*s} opacity={.09+.76*s}/>;}))}
   {pre.map((v,i)=><g key={i}><text className="node-name" x="18" y={ys(4,i)+4}>{names[i]}</text><circle cx="90" cy={ys(4,i)} r={10+v*8}/><text x="90" y={ys(4,i)+4} textAnchor="middle">{v.toFixed(1)}</text></g>)}
   {post.map((v,i)=><g key={i}><circle cx="340" cy={ys(3,i)} r={10+v*8}/><text x="340" y={ys(3,i)+4} textAnchor="middle">{v.toFixed(1)}</text><text className="node-name" x="370" y={ys(3,i)+4}>feature {i+1}</text></g>)}
   <text className="figure-label" x="90" y="274" textAnchor="middle">activity x</text><text className="figure-label" x="340" y="274" textAnchor="middle">activity y</text>
  </svg><div><div className="matrix-caption"><b>ΔW = ηyxᵀ</b><span>3 × 4 matrix</span></div><div className="matrix-grid matrix-four">{matrix.flat().map((v,i)=><span key={i} style={{background:"rgba(32,32,32,"+(.1+.9*clamp(v/.36,0,1))+")",color:v>.18?"#fff":"#333"}}>{v.toFixed(2)}</span>)}</div><small>{repeats} paired events at η = {eta.toFixed(2)}</small></div></div>
  <div className="control-pair"><Range label="Paired firing events" value={repeats} min="0" max="6" step="1" display={repeats} set={setRepeats}/><Range label="Plasticity rate η" value={eta} min=".02" max=".2" step=".01" display={eta.toFixed(2)} set={setEta}/></div>
 </figure>
}

export function OjaFigure(){
 const [steps,setSteps]=useState(18),[angle,setAngle]=useState(32),xv=[Math.cos(angle*Math.PI/180),Math.sin(angle*Math.PI/180)],eta=.075;
 const trajectory=useMemo(()=>{let w=[-.62,.72],out=[w];for(let i=0;i<45;i++){const y=w[0]*xv[0]+w[1]*xv[1];w=[w[0]+eta*y*(xv[0]-y*w[0]),w[1]+eta*y*(xv[1]-y*w[1])];out.push(w)}return out},[angle]);
 const sx=v=>360+v*145,sy=v=>180-v*145,arrows=[];for(let gy=-1;gy<=1;gy+=.25)for(let gx=-1;gx<=1;gx+=.25){const y=gx*xv[0]+gy*xv[1],d=[y*(xv[0]-y*gx),y*(xv[1]-y*gy)],m=Math.hypot(...d)||1;arrows.push({x:gx,y:gy,dx:d[0]/m*13,dy:d[1]/m*13,m:clamp(Math.hypot(...d)*1.5,.12,1)})}
 const visible=trajectory.slice(0,steps+1),path=visible.map((p,i)=>(i?"L":"M")+sx(p[0])+","+sy(p[1])).join(" "),end=visible[visible.length-1];
 return <figure className="learning-figure"><FigureTitle title="Oja’s rule is a field of possible updates" text="Each arrow shows where one update would move a pair of weights. The black path follows one pair until it aligns with the recurring input without growing forever."/>
  <svg className="vector-field" viewBox="0 0 720 360" role="img" aria-label="Oja update vector field and learning trajectory"><defs><marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L8 4L0 8Z"/></marker></defs>
   <line className="axis" x1="196" y1="180" x2="524" y2="180"/><line className="axis" x1="360" y1="16" x2="360" y2="344"/><circle className="unit-ring" cx="360" cy="180" r="145"/>
   {arrows.map((a,i)=><line className="field-arrow" key={i} x1={sx(a.x)-a.dx/2} y1={sy(a.y)+a.dy/2} x2={sx(a.x)+a.dx/2} y2={sy(a.y)-a.dy/2} opacity={.16+.48*a.m} markerEnd="url(#arrow)"/>)}
   <line className="input-direction" x1="360" y1="180" x2={sx(xv[0])} y2={sy(xv[1])}/><text x={sx(xv[0])+8} y={sy(xv[1])-8}>recurring input x</text><path className="trajectory" d={path}/>{visible.map((p,i)=><circle className="trajectory-step" key={i} cx={sx(p[0])} cy={sy(p[1])} r={i===visible.length-1?5:2}/>)}
   <text x="526" y="174">w₁</text><text x="368" y="24">w₂</text><text className="field-note" x="30" y="42">arrows · local update</text><text className="field-note" x="30" y="62">circle · stable magnitude</text><text className="field-note" x="30" y="82">path · actual learning</text>
  </svg><div className="control-pair"><Range label="Updates shown" value={steps} min="1" max="45" step="1" display={steps} set={setSteps}/><Range label="Input direction" value={angle} min="10" max="80" step="1" display={angle+"°"} set={setAngle}/></div><p className="figure-result">Current weight <b>({end[0].toFixed(2)}, {end[1].toFixed(2)})</b></p>
 </figure>
}

export function FastSlowFigure(){
 const [plasticity,setPlasticity]=useState(.65),[delay,setDelay]=useState(2),trace=plasticity*Math.exp(-delay/5),answer=clamp(.17+.76*trace,0,1),memory=[[.02,.01,.03,trace],[.01,.02,.01,.04],[.03,.01,.02,.05],[.02,.03,.01,.08]];
 return <figure className="learning-figure"><FigureTitle title="A temporary association joins a stable model" text="The slow network still performs its learned transform. A fast outer-product memory stores Sector K → LUMEN, then adds one temporary correction to the output scores."/>
  <div className="memory-system" role="img" aria-label="Stable token model with a fast associative memory"><div className="memory-column"><small>cue</small><b>Sector K</b><span>encoded as x</span></div>
   <svg className="slow-network" viewBox="0 0 310 210">{[0,1].flatMap(l=>[0,1,2,3].flatMap(n=>[0,1,2,3].map(m=><line key={l+"-"+n+"-"+m} x1={35+l*120} y1={30+n*50} x2={35+(l+1)*120} y2={30+m*50} opacity={.08+((n+m)%4)*.035}/>)))}{[0,1,2].flatMap(l=>[0,1,2,3].map(n=><circle key={l+"-"+n} cx={35+l*120} cy={30+n*50} r="8"/>))}<text x="35" y="207" textAnchor="middle">tokens</text><text x="155" y="207" textAnchor="middle">features</text><text x="275" y="207" textAnchor="middle">scores</text></svg>
   <div className="memory-column output-column"><small>next-token score</small>{[["LUMEN",answer],["EMBER",.42*(1-trace)],["NORTH",.28*(1-trace)]].map(([name,v])=><span className="score-row" key={name}><em>{name}</em><i><b style={{width:(v*100)+"%"}}/></i><strong>{Math.round(v*100)}%</strong></span>)}</div>
   <div className="fast-memory"><div><small>fast memory F</small><b>recent cue × answer</b></div><div className="memory-matrix">{memory.flat().map((v,i)=><i key={i} style={{opacity:.12+.88*clamp(v/.7,0,1)}}/>)}</div><span className="memory-read">Fx adds a temporary score correction ↑</span></div>
  </div><div className="control-pair"><Range label="Plasticity η" value={plasticity} min="0" max="1" step=".01" display={plasticity.toFixed(2)} set={setPlasticity}/><Range label="Delay after learning" value={delay} min="0" max="12" step="1" display={delay+" steps"} set={setDelay}/></div><p className="figure-result">Remaining fast trace <b>{Math.round(trace*100)}%</b></p>
 </figure>
}
function Range({label,value,min,max,step,display,set}){return <label className="figure-control"><span>{label}<output>{display}</output></span><input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={e=>set(+e.target.value)}/></label>}
function FigureTitle({title,text}){return <figcaption><b>{title}</b><span>{text}</span></figcaption>}

