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

function layout(variant){
 const blocks=[];
 const add=(name,center,size,stage,color=.78)=>blocks.push({name,center,size,stage,color});
 add("token IDs",[-5,-3,0],[1.35,.34,2.2],0,.72);add("token + position embedding",[-3.1,-2.15,0],[2.4,.34,3.4],0,.82);
 for(let l=0;l<3;l++){
  const y=-.9+l*2.35;
  add(`layer ${l+1} · residual`,[-1.8,y,0],[1.65,.34,3.4],l?2:1,.84);
  [-1.35,0,1.35].forEach((z,h)=>add(`head ${h+1} · Q K V`,[.35,y,z],[1.8,.32,.9],1,.68+h*.055));
  add(`layer ${l+1} · attention`,[2.45,y,0],[1.35,.34,3.4],1,.75);
  add(`layer ${l+1} · MLP`,[4.25,y,0],[1.65,.52,3.4],2,.87);
 }
 add("final layer norm",[1.15,6.35,0],[3.1,.34,3.4],4,.8);add("output logits",[4.55,6.35,0],[2.2,.55,3.4],5,.7);
 if(variant==="kv")for(let i=0;i<6;i++){add(`K cache ${i+1}`,[-5.1,-.15+i*.68,-1.05],[1.45,.22,1.65],3,.62);add(`V cache ${i+1}`,[-5.1,-.15+i*.68,1.05],[1.45,.22,1.65],3,.72)}
 if(variant==="plastic")add("fast matrix F",[-5.05,1.55,0],[2.25,3.1,3.4],3,.56);
 return blocks;
}

export default function NanoGptWebGL({variant,eta,retention,step}){
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
   layout(variant).forEach(b=>{gl.uniform3fv(loc.center,b.center);gl.uniform3fv(loc.size,b.size);const pulse=b.stage===step?.22+.12*Math.sin(performance.now()/180):0;gl.uniform1f(loc.active,pulse+(b.stage===step?.62:0));const c=b.color*(variant==="plastic"&&b.name==="fast matrix F"?.72+.28*eta*retention:1);gl.uniform3f(loc.color,c,c,c);gl.drawArrays(gl.TRIANGLES,0,36)});raf=requestAnimationFrame(draw)};draw();
  return()=>{cancelAnimationFrame(raf);ro.disconnect();el.removeEventListener("pointerdown",down);el.removeEventListener("pointermove",move);el.removeEventListener("pointerup",up);el.removeEventListener("wheel",wheel);gl.deleteProgram(program);gl.deleteBuffer(buf);gl.deleteVertexArray(vao)};
 },[variant,eta,retention,step]);
 const branch=variant==="base"?"No external state":variant==="kv"?"Token-indexed K and V cache":"Fixed-size fast matrix F";
 return <figure className="nanogpt-webgl" ref={host}><canvas ref={canvas} aria-label={`Interactive 3D nanoGPT model with ${branch}. Active operation: ${["embedding","attention","MLP","memory read","residual addition","output logits"][step]}`}/><div className="webgl-key"><b>nanoGPT</b><span>3 layers</span><span>3 heads</span><span>48 channels</span></div><div className="webgl-stage"><span>{branch}</span><b>{["Embedding lookup","Q, K, V projections","Frozen MLP","Temporary-memory read","Residual stream","Output logits"][step]}</b></div><figcaption>Drag to orbit. Scroll to inspect the tensor volumes.</figcaption></figure>;
}
