"use client";

import {useEffect,useRef,useState} from "react";

const VERT=`#version 300 es
precision highp float;
layout(location=0) in vec3 position;
layout(location=1) in vec3 normal;
uniform mat4 projection;
uniform mat4 view;
uniform vec3 center;
uniform vec3 size;
out vec3 n;
out vec3 cell;
void main(){n=normal;cell=(position+.5)*size*4.;gl_Position=projection*view*vec4(center+position*size,1.);}`;
const FRAG=`#version 300 es
precision highp float;
in vec3 n;
in vec3 cell;
uniform vec3 color;
uniform float emphasis;
out vec4 outColor;
void main(){
 vec3 light=normalize(vec3(.45,.75,.65));
 float lit=.72+.28*max(dot(normalize(n),light),0.);
 vec3 g=abs(fract(cell-.5)-.5)/fwidth(cell);
 float grid=1.-min(min(g.x,g.y),g.z);
 vec3 base=mix(color,vec3(.96),smoothstep(.88,1.,grid)*.45);
 outColor=vec4(mix(base*lit,vec3(.12,.12,.12),emphasis*.72),1.);
}`;

const cubePositions=new Float32Array([
 // front
-.5,-.5,.5, 0,0,1, .5,-.5,.5,0,0,1, .5,.5,.5,0,0,1, -.5,-.5,.5,0,0,1, .5,.5,.5,0,0,1, -.5,.5,.5,0,0,1,
 // back
.5,-.5,-.5,0,0,-1, -.5,-.5,-.5,0,0,-1, -.5,.5,-.5,0,0,-1, .5,-.5,-.5,0,0,-1, -.5,.5,-.5,0,0,-1, .5,.5,-.5,0,0,-1,
 // left
-.5,-.5,-.5,-1,0,0, -.5,-.5,.5,-1,0,0, -.5,.5,.5,-1,0,0, -.5,-.5,-.5,-1,0,0, -.5,.5,.5,-1,0,0, -.5,.5,-.5,-1,0,0,
 // right
.5,-.5,.5,1,0,0, .5,-.5,-.5,1,0,0, .5,.5,-.5,1,0,0, .5,-.5,.5,1,0,0, .5,.5,-.5,1,0,0, .5,.5,.5,1,0,0,
 // top
-.5,.5,.5,0,1,0, .5,.5,.5,0,1,0, .5,.5,-.5,0,1,0, -.5,.5,.5,0,1,0, .5,.5,-.5,0,1,0, -.5,.5,-.5,0,1,0,
 // bottom
-.5,-.5,-.5,0,-1,0, .5,-.5,-.5,0,-1,0, .5,-.5,.5,0,-1,0, -.5,-.5,-.5,0,-1,0, .5,-.5,.5,0,-1,0, -.5,-.5,.5,0,-1,0]);

const mul=(a,b)=>{const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];return o};
const perspective=(fov,aspect,near,far)=>{const f=1/Math.tan(fov/2),nf=1/(near-far);return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*nf,-1,0,0,2*far*near*nf,0])};
const lookAt=(eye,target)=>{let z=norm(sub(eye,target)),x=norm(cross([0,1,0],z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1])};
const sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>{const l=Math.hypot(...a)||1;return a.map(v=>v/l)};
const compile=(gl,type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};

const COLORS={weight:[.31,.34,.43],activation:[.34,.50,.38],aggregate:[.80,.66,.28],residual:[.67,.82,.67],memory:[.37,.49,.68]};
function overviewLayout(variant){
 const blocks=[],add=(name,center,size,stage,color)=>blocks.push({name,center,size,stage,color});
 add("tokens",[-2.7,-5.4,0],[1.2,.28,2.2],0,COLORS.activation);add("embedding",[-1.0,-4.65,0],[2.7,.28,3.1],0,COLORS.activation);
 for(let l=0;l<3;l++){
  const y=-3.15+l*3.2;
  add(`transformer ${l} input`,[-1.2,y,0],[2.35,.25,3.1],l===0?1:2,COLORS.residual);
  [-1.15,0,1.15].forEach((z,h)=>add(`layer ${l+1} head ${h+1}`,[1.55,y+.5,z],[1.45,.28,.8],1,COLORS.activation));
  add(`transformer ${l} projection`,[3.5,y+.5,0],[1.15,.35,3.1],1,COLORS.activation);
  add(`transformer ${l} mlp`,[.6,y+1.25,0],[4.1,.42,3.1],2,COLORS.weight);
  if(variant==="kv")add(`layer ${l+1} KV`,[-3.75,y+.5,0],[1.15,1.45,2.6],3,COLORS.memory);
  if(variant==="plastic")add(`layer ${l+1} F`,[-3.75,y+.5,0],[1.15,1.45,2.6],3,COLORS.memory);
 }
 add("final norm",[-.7,6.7,0],[2.4,.28,3.1],4,COLORS.residual);add("logits",[2.3,7.35,0],[2.2,.42,3.1],5,COLORS.activation);
 return blocks;
}
function layout(variant,view){
 if(view==="overview")return overviewLayout(variant);
 const blocks=[];
 const add=(name,center,size,stage,color)=>blocks.push({name,center,size,stage,color});
 add("embedding",[-5.1,-3.25,0],[1.4,.32,2.5],0,COLORS.activation);
 [-2.15,0,2.15].forEach((z,i)=>add(`${["Q","K","V"][i]} weights`,[-3.35,-1.9,z],[2.3,1.35,.18],1,COLORS.weight));
 [-2.15,0,2.15].forEach((z,i)=>add(`${["Q","K","V"][i]} vectors`,[-.55,-.95,z],[1.2,1.75,.34],1,COLORS.activation));
 add("QK transpose",[1.55,.2,-1.05],[1.65,1.7,.25],1,COLORS.activation);
 add("softmax",[3.7,.2,-1.05],[1.65,1.7,.25],1,COLORS.activation);
 add("V output",[3.7,.2,1.05],[1.65,1.7,.25],1,COLORS.activation);
 add("projection weights",[-.25,2.1,0],[3.1,1.35,.2],1,COLORS.weight);
 add("attention output",[3.05,2.1,0],[1.4,1.75,.35],1,COLORS.activation);
 add("attention residual",[5.15,2.1,0],[1.1,2.65,.45],4,COLORS.residual);
 add("layer norm",[5.15,4.65,0],[1.1,1.7,.45],2,COLORS.activation);
 add("MLP weights",[1.0,4.65,0],[4.1,1.25,.2],2,COLORS.weight);
 add("MLP activation",[-2.25,4.65,0],[1.35,2.05,.4],2,COLORS.activation);
 add("output logits",[-4.65,4.65,0],[1.45,2.6,.45],5,COLORS.activation);
 if(variant==="kv")for(let i=0;i<6;i++){add(`K cache ${i+1}`,[-5.25,-.35+i*.45,-1.0],[1.25,.18,1.3],3,COLORS.memory);add(`V cache ${i+1}`,[-5.25,-.35+i*.45,1.0],[1.25,.18,1.3],3,COLORS.activation)}
 if(variant==="plastic")add("fast matrix F",[-5.15,1.0,0],[1.65,2.25,2.5],3,COLORS.memory);
 return blocks;
}

const DETAIL_NODES=[
 {name:"Q weights",p:[-3.35,-.9,-2.15],stage:1},{name:"K weights",p:[-3.35,-.9,0],stage:1},{name:"V weights",p:[-3.35,-.9,2.15],stage:1},
 {name:"Q vectors",p:[-.55,.15,-2.15],stage:1},{name:"K vectors",p:[-.55,.15,0],stage:1},{name:"V vectors",p:[-.55,.15,2.15],stage:1},
 {name:"QKᵀ",p:[1.55,1.2,-1.05],stage:1},{name:"Attention matrix",p:[1.55,-.8,-1.05],stage:1},{name:"softmax",p:[3.7,1.2,-1.05],stage:1},{name:"V output",p:[3.7,1.2,1.05],stage:1},
 {name:"Projection weights",p:[-.25,2.9,0],stage:1},{name:"Attention output",p:[3.05,3.2,0],stage:1},{name:"Residual",p:[5.15,3.6,0],stage:4},
 {name:"Layer norm",p:[5.15,5.7,0],stage:2},{name:"MLP",p:[1,5.45,0],stage:2},{name:"Logits",p:[-4.65,6.2,0],stage:5}
];
const DETAIL_EDGES=[["Q weights","Q vectors"],["K weights","K vectors"],["V weights","V vectors"],["Q vectors","QKᵀ"],["K vectors","QKᵀ"],["QKᵀ","Attention matrix"],["Attention matrix","softmax"],["softmax","V output"],["V vectors","V output"],["V output","Attention output"],["Projection weights","Attention output"],["Attention output","Residual"],["Residual","Layer norm"],["Layer norm","MLP"],["MLP","Logits"]];
const OVERVIEW_NODES=[0,1,2].map((n,i)=>({name:`Transformer ${n}`,p:[-4.4,-1.4+i*3.2,0],stage:i?2:1,description:"layer norm · 3 attention heads · MLP"}));
const MATRICES={q:[[.8,.1,.6],[.2,.7,.3],[.5,.2,.9]],k:[[.7,.3,.4],[.1,.8,.5],[.6,.2,.7]],v:[[.2,.8,.4],[.7,.1,.6],[.3,.5,.9]]};
const mm=(a,b)=>a.map(r=>b[0].map((_,j)=>r.reduce((s,x,k)=>s+x*b[k][j],0))),transpose=a=>a[0].map((_,i)=>a.map(r=>r[i])),softmaxRows=a=>a.map(r=>{const m=Math.max(...r),e=r.map(v=>Math.exp(v-m)),z=e.reduce((s,v)=>s+v,0);return e.map(v=>v/z)});

export default function NanoGptWebGL({variant,eta,retention,step,setStep,setEta}){
 const [view,setView]=useState("overview");
 const [selectedProduct,setSelectedProduct]=useState({op:"qk",row:0,col:0});
 const canvas=useRef(null),host=useRef(null),labelLayer=useRef(null),arrowLayer=useRef(null),state=useRef({yaw:-.36,pitch:.28,zoom:23,drag:false,x:0,y:0});
 useEffect(()=>{
  const el=canvas.current,box=host.current,gl=el.getContext("webgl2",{antialias:true,alpha:true});if(!gl)return;
  const program=gl.createProgram();gl.attachShader(program,compile(gl,gl.VERTEX_SHADER,VERT));gl.attachShader(program,compile(gl,gl.FRAGMENT_SHADER,FRAG));gl.linkProgram(program);
  const vao=gl.createVertexArray();gl.bindVertexArray(vao);const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,cubePositions,gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,24,12);
  const u=n=>gl.getUniformLocation(program,n),loc={projection:u("projection"),view:u("view"),center:u("center"),size:u("size"),color:u("color"),active:u("emphasis")};
  const resize=()=>{const d=Math.min(devicePixelRatio,2),w=Math.max(1,box.clientWidth),h=Math.max(1,box.clientHeight);el.width=w*d;el.height=h*d;gl.viewport(0,0,el.width,el.height)};const ro=new ResizeObserver(resize);ro.observe(box);resize();
  const down=e=>{state.current.drag=true;state.current.x=e.clientX;state.current.y=e.clientY;el.setPointerCapture(e.pointerId)},move=e=>{if(!state.current.drag)return;state.current.yaw+=(e.clientX-state.current.x)*.008;state.current.pitch=Math.max(-.1,Math.min(.85,state.current.pitch+(e.clientY-state.current.y)*.006));state.current.x=e.clientX;state.current.y=e.clientY},up=()=>state.current.drag=false,wheel=e=>{e.preventDefault();state.current.zoom=Math.max(12,Math.min(28,state.current.zoom+e.deltaY*.012))};
  el.addEventListener("pointerdown",down);el.addEventListener("pointermove",move);el.addEventListener("pointerup",up);el.addEventListener("wheel",wheel,{passive:false});let raf;
  const draw=()=>{const s=state.current,r=s.zoom,eye=[Math.sin(s.yaw)*Math.cos(s.pitch)*r,(view==="overview"?1:3)+Math.sin(s.pitch)*r,Math.cos(s.yaw)*Math.cos(s.pitch)*r],projection=perspective(view==="overview"?.72:.62,el.width/el.height,.1,100),viewMtx=lookAt(eye,[0,view==="overview"?1:1.7,0]);gl.clearColor(.965,.965,.95,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);gl.useProgram(program);gl.bindVertexArray(vao);gl.uniformMatrix4fv(loc.projection,false,projection);gl.uniformMatrix4fv(loc.view,false,viewMtx);
   layout(variant,view).forEach(b=>{gl.uniform3fv(loc.center,b.center);gl.uniform3fv(loc.size,b.size);const pulse=b.stage===step?.18+.08*Math.sin(performance.now()/180):0;gl.uniform1f(loc.active,pulse+(b.stage===step?.42:0));const f=variant==="plastic"&&(b.name==="fast matrix F"||b.name.endsWith(" F"))?.65+.35*eta*retention:1;gl.uniform3f(loc.color,b.color[0]*f,b.color[1]*f,b.color[2]*f);gl.drawArrays(gl.TRIANGLES,0,36)});
   const pv=mul(projection,viewMtx),w=box.clientWidth,h=box.clientHeight,project=p=>{const q=[0,0,0,0];for(let row=0;row<4;row++)q[row]=pv[row]*p[0]+pv[4+row]*p[1]+pv[8+row]*p[2]+pv[12+row];return [(q[0]/q[3]*.5+.5)*w,(1-(q[1]/q[3]*.5+.5))*h,q[3]]};
   box.querySelectorAll("[data-world]").forEach(node=>{const p=node.dataset.world.split(",").map(Number),q=project(p);node.style.left=q[0]+"px";node.style.top=q[1]+"px";node.style.visibility=q[2]>0?"visible":"hidden"});
   if(arrowLayer.current){arrowLayer.current.setAttribute("viewBox",`0 0 ${w} ${h}`);arrowLayer.current.querySelectorAll("path[data-from]").forEach(path=>{const a=box.querySelector(`[data-name="${path.dataset.from}"]`),b=box.querySelector(`[data-name="${path.dataset.to}"]`);if(!a||!b)return;const x1=parseFloat(a.style.left),y1=parseFloat(a.style.top),x2=parseFloat(b.style.left),y2=parseFloat(b.style.top),bend=Math.max(18,Math.abs(x2-x1)*.22);path.setAttribute("d",`M${x1},${y1} C${x1+bend},${y1} ${x2-bend},${y2} ${x2},${y2}`)})}
   raf=requestAnimationFrame(draw)};draw();
  return()=>{cancelAnimationFrame(raf);ro.disconnect();el.removeEventListener("pointerdown",down);el.removeEventListener("pointermove",move);el.removeEventListener("pointerup",up);el.removeEventListener("wheel",wheel);gl.deleteProgram(program);gl.deleteBuffer(buf);gl.deleteVertexArray(vao)};
 },[variant,eta,retention,step,view]);
 const branch=variant==="base"?"No external state":variant==="kv"?"Token-indexed K and V cache":"Fixed-size fast matrix F";
 const scores=mm(MATRICES.q,transpose(MATRICES.k)),attn=softmaxRows(scores),out=mm(attn,MATRICES.v),cell=(out[0][0]+(variant==="plastic"?eta*retention*.5:0)).toFixed(2);
 const {op:dotOp,row:dotRow,col:dotCol}=selectedProduct,dotLeft=dotOp==="qk"?MATRICES.q[dotRow]:attn[dotRow],dotRight=dotOp==="qk"?MATRICES.k[dotCol]:transpose(MATRICES.v)[dotCol],dotValue=dotOp==="qk"?scores[dotRow][dotCol]:out[dotRow][dotCol];
 return <figure className="nanogpt-webgl" ref={host}>
  <div className={`webgl-scene ${view}`}><canvas ref={canvas} aria-label={`Interactive labeled 3D nanoGPT ${view} with ${branch}`}/><svg ref={arrowLayer} className="webgl-arrows" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="flow-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5Z"/></marker></defs>{view==="detail"&&DETAIL_EDGES.map(([from,to],i)=><path key={from+to} data-from={from} data-to={to} className={i<12&&step===1?"hot":i>=12&&step===2?"hot":""}/>)}</svg>
   <div ref={labelLayer} className={view==="detail"?"webgl-labels":"model-overview-labels"}>{view==="detail"?DETAIL_NODES.map(node=><button key={node.name} data-name={node.name} data-world={node.p.join(",")} className={node.stage===step?"active":""} onClick={()=>setStep?.(node.stage)}>{node.name}</button>):<><div><b>nano-gpt</b><span>n_params = <strong>85,584</strong></span></div>{OVERVIEW_NODES.map(node=><button key={node.name} data-name={node.name} data-world={node.p.join(",")} onClick={()=>{setView("detail");setStep?.(1)}}>{node.name}<small>{node.description}</small></button>)}</>}</div>
   {view==="detail"&&step===1&&<div className="matrix-callout" data-world={dotOp==="qk"?"2.55,-1.15,-1.05":"4.55,-.2,1.05"}><span>{dotOp==="qk"?"QKᵀ score":"attention × V"} · row {dotRow+1}, column {dotCol+1}</span><b>dot( <i>[{dotLeft.map(v=>v.toFixed(2)).join(", ")}]</i>, <i>[{dotRight.map(v=>v.toFixed(2)).join(", ")}]</i> ) = {dotValue.toFixed(2)}</b><small>{dotLeft.map((v,i)=>`${v.toFixed(2)} × ${dotRight[i].toFixed(2)}`).join(" + ")}</small></div>}
   <div className="view-switch" role="tablist" aria-label="Model view"><button className={view==="overview"?"active":""} onClick={()=>{state.current.zoom=23;setView("overview")}}>Whole model</button><button className={view==="detail"?"active":""} onClick={()=>{state.current.zoom=18;setView("detail")}}>Inside transformer</button></div>
   <div className="webgl-key"><b>nanoGPT · {view==="overview"?"complete architecture":"expanded transformer"}</b><span>{view==="overview"?"select a transformer to open it":"click a named tensor to inspect its stage"}</span></div><div className="webgl-stage"><span>{branch}</span><b>{["Embedding lookup","Attention arithmetic","Frozen MLP","Temporary-memory read","Residual stream","Output logits"][step]}</b></div>
  </div>
  {view==="detail"&&<div className="tensor-workbench" aria-label="Attention matrix multiplication walkthrough"><div className="tensor-equation"><Matrix title="Q" data={MATRICES.q}/><strong>×</strong><Matrix title="Kᵀ" data={transpose(MATRICES.k)}/><strong>=</strong><Matrix title="QKᵀ scores · select" data={scores} selected={dotOp==="qk"?[dotRow,dotCol]:null} onSelect={(r,c)=>{setSelectedProduct({op:"qk",row:r,col:c});setStep?.(1)}}/><strong>softmax →</strong><Matrix title="attention" data={attn}/><strong>×</strong><Matrix title="V" data={MATRICES.v}/><strong>=</strong><Matrix title="output · select" data={out} selected={dotOp==="av"?[dotRow,dotCol]:null} onSelect={(r,c)=>{setSelectedProduct({op:"av",row:r,col:c});setStep?.(1)}}/></div><p><b>{dotOp==="qk"?"QKᵀ dot product":"Attention × V dot product"}:</b> {dotLeft.map((v,i)=>`${v.toFixed(2)} × ${dotRight[i].toFixed(2)}`).join(" + ")} = <strong>{dotValue.toFixed(2)}</strong>. {dotOp==="qk"?"Softmax converts this score row into attention weights.":<>The displayed fast-memory-adjusted output[0,0] is <strong>{cell}</strong>.</>}</p></div>}
  {variant==="plastic"&&<label className="inline-plasticity"><span>Plasticity η <output>{eta.toFixed(2)}</output></span><input type="range" min="0" max="1" step="0.05" value={eta} onChange={e=>setEta?.(Number(e.target.value))}/><small>Changes F = ηvkᵀ and the output above immediately.</small></label>}
  <figcaption>Tensor geometry follows the LLM Visualizer’s expanded computational view. Drag to orbit; scroll to zoom.</figcaption>
 </figure>;
}

function Matrix({title,data,selected,onSelect}){return <div className={`mini-matrix ${onSelect?"interactive":""}`}><span>{title}</span><div>{data.flat().map((v,i)=>{const r=Math.floor(i/3),c=i%3,active=selected?.[0]===r&&selected?.[1]===c;return onSelect?<button key={i} className={active?"selected":""} style={{opacity:.28+Math.min(1,Math.abs(v))*.72}} onClick={()=>onSelect(r,c)} aria-label={`${title} row ${r+1} column ${c+1}: ${v.toFixed(2)}`}>{v.toFixed(1)}</button>:<i key={i} style={{opacity:.28+Math.min(1,Math.abs(v))*.72}}>{v.toFixed(1)}</i>})}</div></div>}
