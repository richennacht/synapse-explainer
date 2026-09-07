import { initialState, applyEvent } from "./simulation.js";
import { createSynapseRenderer } from "./renderer.js";

const $ = selector => document.querySelector(selector);
const percent = value => `${Math.round(value*100)}%`;
let state = initialState();
let renderer = { update(){}, pause(){}, play(){}, redraw(){} };

function drawChart() {
  const canvas=$("#plot"), ctx=canvas.getContext("2d");
  const scale=Math.min(devicePixelRatio||1,2), width=canvas.clientWidth, height=canvas.clientHeight;
  canvas.width=Math.round(width*scale); canvas.height=Math.round(height*scale); ctx.scale(scale,scale);
  ctx.clearRect(0,0,width,height);
  const style=getComputedStyle(document.documentElement);
  const muted=style.getPropertyValue("--muted").trim()||"#818986";
  ctx.font="12px Lato"; ctx.fillStyle=muted; ctx.strokeStyle="#26302d"; ctx.lineWidth=1;
  [0,.25,.5,.75,1].forEach(value=>{const y=height-34-value*(height-58);ctx.beginPath();ctx.moveTo(42,y);ctx.lineTo(width-14,y);ctx.stroke();ctx.fillText(`${Math.round(value*100)}%`,6,y+4);});
  const plot=(key,color,dash=[])=>{ctx.strokeStyle=color;ctx.lineWidth=4;ctx.setLineDash(dash);ctx.beginPath();state.history.forEach((point,index)=>{const x=42+(index/Math.max(1,state.history.length-1))*(width-58);const y=height-34-point[key]*(height-58);index?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();ctx.setLineDash([]);};
  plot("strength","#00b99a"); plot("interference","#812786",[8,6]);
  ctx.fillStyle="#00b99a";ctx.fillText("Memory strength",48,18);ctx.fillStyle="#a94caf";ctx.fillText("Interference",168,18);
}

function narrative() {
  if(state.phase==="Idle") return "Add a demonstration to write the first temporary association.";
  if(state.phase==="Encoding") return "The new association was added to temporary state; slow parameters did not change.";
  if(state.phase==="Interference") return "A competing write reduced confidence in the original association.";
  if(state.phase==="Recalled") return "The stored association is stronger than its competitor, so recall succeeds.";
  return "Interference is at least as strong as the stored association, so recall is uncertain.";
}

function render() {
  $("#phase-label").textContent=state.phase;
  $("#strength").textContent=percent(state.memoryStrength);
  $("#interference").textContent=percent(state.interference);
  $("#count").textContent=state.demonstrations;
  $("#matrix-memory").textContent=state.memoryStrength.toFixed(3);
  $("#matrix-interference").textContent=state.interference.toFixed(3);
  $("#decay-value").textContent=state.decay.toFixed(2);
  $("#state-summary").textContent=narrative();
  $("#prediction").textContent=state.phase==="Recalled"?$("#action").value:state.phase==="Uncertain"?"uncertain":"not tested";
  $("#expected").textContent=$("#action").value;
  renderer.update(state); drawChart();
}

function dispatch(event){state=applyEvent(state,event);render();}
$("#demonstrate").addEventListener("click",()=>dispatch({type:"DEMONSTRATE"}));
$("#conflict").addEventListener("click",()=>dispatch({type:"CONFLICT"}));
$("#test").addEventListener("click",()=>dispatch({type:"TEST"}));
$("#decay").addEventListener("input",event=>dispatch({type:"SET_DECAY",value:Number(event.target.value)}));
$("#reset").addEventListener("click",()=>{state=initialState();render();});
$("#pause").addEventListener("click",event=>{const paused=event.currentTarget.getAttribute("aria-pressed")==="true";event.currentTarget.setAttribute("aria-pressed",String(!paused));event.currentTarget.textContent=paused?"Pause motion":"Resume motion";paused?renderer.play():renderer.pause();});

const chapterTargets=[...document.querySelectorAll(".chapters a")]
  .map(link=>document.querySelector(link.hash)).filter(Boolean);
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){document.querySelectorAll(".chapters a").forEach(link=>link.classList.toggle("active",link.hash===`#${entry.target.id}`));}}),{rootMargin:"-35% 0px -55%"});
chapterTargets.forEach(target=>observer.observe(target));
window.addEventListener("resize",drawChart);
window.addEventListener("load",()=>{
  if(window.katex) window.katex.render("M_t = \\lambda M_{t-1} + \\eta v_t k_t^{\\mathsf T}",$("#equation"),{displayMode:true,throwOnError:false});
  try{renderer=createSynapseRenderer($("#gl-canvas"));}catch(error){$("#webgl-status").textContent=error.message;$("#webgl-status").hidden=false;}
  render();
});

