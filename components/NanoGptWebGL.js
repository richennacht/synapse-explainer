"use client";

import {useEffect,useRef} from "react";

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
function layout(variant){
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

const LABELS=[
 ["Q weights",16,25,1],["K weights",25,20,1],["V weights",34,15,1],["Q vectors",42,29,1],["K vectors",51,24,1],["V vectors",59,19,1],
 ["QKᵀ",61,43,1],["Attention matrix",70,48,1],["softmax",78,42,1],["V output",79,58,1],["Projection weights",42,67,1],["Attention output",68,69,1],
 ["Residual",88,62,4],["Layer norm",88,35,2],["MLP",48,84,2],["Logits",17,84,5]
];
const ARROWS=["M17 31 C25 33 34 32 42 32","M28 26 C35 28 42 27 51 27","M38 21 C45 22 52 21 59 22","M47 32 C53 35 57 38 61 43","M56 27 C60 31 62 36 64 42","M64 44 C68 44 72 43 77 43","M62 23 C70 30 75 45 78 55","M72 51 C75 54 77 56 79 58","M60 66 C64 67 67 68 69 69","M72 69 C78 68 83 65 87 62","M87 58 C90 50 90 42 88 36","M84 36 C70 51 62 72 51 82","M46 83 C36 83 27 83 19 83"];
const MATRICES={q:[[.8,.1,.6],[.2,.7,.3],[.5,.2,.9]],k:[[.7,.3,.4],[.1,.8,.5],[.6,.2,.7]],v:[[.2,.8,.4],[.7,.1,.6],[.3,.5,.9]]};
const mm=(a,b)=>a.map(r=>b[0].map((_,j)=>r.reduce((s,x,k)=>s+x*b[k][j],0))),transpose=a=>a[0].map((_,i)=>a.map(r=>r[i]));

export default function NanoGptWebGL({variant,eta,retention,step,setStep,setEta}){
 const canvas=useRef(null),host=useRef(null),state=useRef({yaw:-.54,pitch:.36,zoom:18,drag:false,x:0,y:0});
 useEffect(()=>{
  const el=canvas.current,box=host.current,gl=el.getContext("webgl2",{antialias:true,alpha:true});if(!gl)return;
  const program=gl.createProgram();gl.attachShader(program,compile(gl,gl.VERTEX_SHADER,VERT));gl.attachShader(program,compile(gl,gl.FRAGMENT_SHADER,FRAG));gl.linkProgram(program);
  const vao=gl.createVertexArray();gl.bindVertexArray(vao);const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,cubePositions,gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,24,12);
  const u=n=>gl.getUniformLocation(program,n),loc={projection:u("projection"),view:u("view"),center:u("center"),size:u("size"),color:u("color"),active:u("emphasis")};
  const resize=()=>{const d=Math.min(devicePixelRatio,2),w=Math.max(1,box.clientWidth),h=Math.max(1,box.clientHeight);el.width=w*d;el.height=h*d;gl.viewport(0,0,el.width,el.height)};const ro=new ResizeObserver(resize);ro.observe(box);resize();
  const down=e=>{state.current.drag=true;state.current.x=e.clientX;state.current.y=e.clientY;el.setPointerCapture(e.pointerId)},move=e=>{if(!state.current.drag)return;state.current.yaw+=(e.clientX-state.current.x)*.008;state.current.pitch=Math.max(-.1,Math.min(.85,state.current.pitch+(e.clientY-state.current.y)*.006));state.current.x=e.clientX;state.current.y=e.clientY},up=()=>state.current.drag=false,wheel=e=>{e.preventDefault();state.current.zoom=Math.max(12,Math.min(28,state.current.zoom+e.deltaY*.012))};
  el.addEventListener("pointerdown",down);el.addEventListener("pointermove",move);el.addEventListener("pointerup",up);el.addEventListener("wheel",wheel,{passive:false});let raf;
  const draw=()=>{const s=state.current,r=s.zoom,eye=[Math.sin(s.yaw)*Math.cos(s.pitch)*r,3+Math.sin(s.pitch)*r,Math.cos(s.yaw)*Math.cos(s.pitch)*r];gl.clearColor(.965,.965,.95,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);gl.useProgram(program);gl.bindVertexArray(vao);gl.uniformMatrix4fv(loc.projection,false,perspective(.62,el.width/el.height,.1,100));gl.uniformMatrix4fv(loc.view,false,lookAt(eye,[0,1.7,0]));
   layout(variant).forEach(b=>{gl.uniform3fv(loc.center,b.center);gl.uniform3fv(loc.size,b.size);const pulse=b.stage===step?.18+.08*Math.sin(performance.now()/180):0;gl.uniform1f(loc.active,pulse+(b.stage===step?.42:0));const f=variant==="plastic"&&b.name==="fast matrix F"?.65+.35*eta*retention:1;gl.uniform3f(loc.color,b.color[0]*f,b.color[1]*f,b.color[2]*f);gl.drawArrays(gl.TRIANGLES,0,36)});raf=requestAnimationFrame(draw)};draw();
  return()=>{cancelAnimationFrame(raf);ro.disconnect();el.removeEventListener("pointerdown",down);el.removeEventListener("pointermove",move);el.removeEventListener("pointerup",up);el.removeEventListener("wheel",wheel);gl.deleteProgram(program);gl.deleteBuffer(buf);gl.deleteVertexArray(vao)};
 },[variant,eta,retention,step]);
 const branch=variant==="base"?"No external state":variant==="kv"?"Token-indexed K and V cache":"Fixed-size fast matrix F";
 const attn=mm(MATRICES.q,transpose(MATRICES.k)),out=mm(attn,MATRICES.v),cell=(out[0][0]+(variant==="plastic"?eta*retention*.5:0)).toFixed(2);
 return <figure className="nanogpt-webgl" ref={host}>
  <div className="webgl-scene"><canvas ref={canvas} aria-label={`Interactive labeled 3D nanoGPT model with ${branch}`}/><svg className="webgl-arrows" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="flow-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5Z"/></marker></defs>{ARROWS.map((d,i)=><path key={d} d={d} className={i<=9&&step===1?"hot":i>9&&step===2?"hot":""}/>)}</svg>
   <div className="webgl-labels">{LABELS.map(([name,x,y,s])=><button key={name} className={s===step?"active":""} style={{left:x+"%",top:y+"%"}} onClick={()=>setStep?.(s)}>{name}</button>)}</div>
   <div className="webgl-key"><b>nanoGPT · expanded transformer</b><span>click a named tensor to inspect its stage</span></div><div className="webgl-stage"><span>{branch}</span><b>{["Embedding lookup","Attention arithmetic","Frozen MLP","Temporary-memory read","Residual stream","Output logits"][step]}</b></div>
  </div>
  <div className="tensor-workbench" aria-label="Attention matrix multiplication walkthrough"><div className="tensor-equation"><Matrix title="Q" data={MATRICES.q}/><strong>×</strong><Matrix title="Kᵀ" data={transpose(MATRICES.k)}/><strong>=</strong><Matrix title="QKᵀ" data={attn}/><strong>×</strong><Matrix title="V" data={MATRICES.v}/><strong>=</strong><Matrix title="output" data={out}/></div><p><b>Selected cell:</b> (0.8 × 0.7 + 0.1 × 0.3 + 0.6 × 0.4) then multiplied by V = <strong>{cell}</strong>{variant==="plastic"&&" after the fast-memory correction"}.</p></div>
  {variant==="plastic"&&<label className="inline-plasticity"><span>Plasticity η <output>{eta.toFixed(2)}</output></span><input type="range" min="0" max="1" step="0.05" value={eta} onChange={e=>setEta?.(Number(e.target.value))}/><small>Changes F = ηvkᵀ and the output above immediately.</small></label>}
  <figcaption>Tensor geometry follows the LLM Visualizer’s expanded computational view. Drag to orbit; scroll to zoom.</figcaption>
 </figure>;
}

function Matrix({title,data}){return <div className="mini-matrix"><span>{title}</span><div>{data.flat().map((v,i)=><i key={i} style={{opacity:.28+Math.min(1,Math.abs(v))*.72}}>{v.toFixed(1)}</i>)}</div></div>}
