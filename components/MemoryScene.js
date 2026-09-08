"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const ink = new THREE.Color(0x252525);
const quiet = new THREE.Color(0xb9b9b9);
const paper = new THREE.Color(0xf7f7f5);
const blue = new THREE.Color(0x7f9fb9);

function slab(width, height, depth, color) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.94 })
  );
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color: 0x777777, transparent: true, opacity: 0.5 })
  );
  mesh.add(edges);
  return mesh;
}

function label(text, size = 42) {
  const canvas = document.createElement("canvas");
  canvas.width = 512; canvas.height = 96;
  const ctx = canvas.getContext("2d");
  ctx.font = `500 ${size}px Arial`; ctx.fillStyle = "#333"; ctx.textAlign = "center";
  ctx.fillText(text, 256, 62);
  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  sprite.scale.set(3.6, 0.68, 1);
  return sprite;
}

export default function MemoryScene({ state }) {
  const host = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    const el = host.current;
    const scene = new THREE.Scene();
    scene.background = paper;
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 7.2, 15.5);
    camera.lookAt(0, 0, 0);
    const canvas = canvasRef.current;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false }); }
    catch {
      const resizeFallback = () => { canvas.width = el.clientWidth * Math.min(devicePixelRatio, 2); canvas.height = el.clientHeight * Math.min(devicePixelRatio, 2); };
      const ro = new ResizeObserver(resizeFallback); ro.observe(el); resizeFallback();
      sceneRef.current = { fallback: canvas };
      return () => ro.disconnect();
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    const kv = new THREE.Group(); kv.position.x = -4.1; scene.add(kv);
    const plastic = new THREE.Group(); plastic.position.x = 4.1; scene.add(plastic);
    const kvTitle = label("KV CACHE"); kvTitle.position.set(0, 3.5, 0); kv.add(kvTitle);
    const pTitle = label("PLASTIC STATE"); pTitle.position.set(0, 3.5, 0); plastic.add(pTitle);

    const slow = slab(4.6, .18, 3.8, quiet); slow.position.y = -2.55; plastic.add(slow);
    const fast = new THREE.Group(); fast.name = "fast"; plastic.add(fast);
    const tokens = new THREE.Group(); tokens.name = "tokens"; kv.add(tokens);

    for (let i = 0; i < 8; i += 1) {
      const neuron = new THREE.Mesh(new THREE.SphereGeometry(.16, 18, 18), new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? ink : quiet }));
      neuron.position.set(-1.6 + (i % 4) * 1.05, 1.5 - Math.floor(i / 4) * 1.05, 0);
      plastic.add(neuron);
    }
    for (let r = 0; r < 8; r += 1) for (let c = 0; c < 8; c += 1) {
      const cell = slab(.31, .08, .31, quiet); cell.position.set(-1.13 + c * .33, -.38, -1.13 + r * .33); cell.userData.index = r * 8 + c; fast.add(cell);
    }

    const divider = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -3.2, 0), new THREE.Vector3(0, 3.5, 0)]),
      new THREE.LineBasicMaterial({ color: 0xcccccc })
    ); scene.add(divider);

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize); ro.observe(el); resize();
    let raf;
    let yaw = 0;
    let pitch = .43;
    let distance = 16.9;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const onDown = event => { dragging = true; lastX = event.clientX; lastY = event.clientY; canvas.setPointerCapture(event.pointerId); };
    const onMove = event => {
      if (!dragging) return;
      yaw += (event.clientX - lastX) * .006;
      pitch = THREE.MathUtils.clamp(pitch + (event.clientY - lastY) * .004, .18, .82);
      lastX = event.clientX; lastY = event.clientY;
    };
    const onUp = event => { dragging = false; if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId); };
    const onWheel = event => { event.preventDefault(); distance = THREE.MathUtils.clamp(distance + event.deltaY * .012, 12, 22); };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    const draw = time => {
      const idle = dragging ? 0 : Math.sin(time * .00018) * .045;
      camera.position.set(
        Math.sin(yaw + idle) * distance,
        Math.sin(pitch) * distance,
        Math.cos(yaw + idle) * Math.cos(pitch) * distance
      );
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      el.dataset.webgl = "ready";
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    sceneRef.current = { scene, renderer, tokens, fast };
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, []);

  useEffect(() => {
    const current = sceneRef.current; if (!current) return;
    if (current.fallback) {
      const canvas=current.fallback,d=Math.min(devicePixelRatio,2),ctx=canvas.getContext("2d"),w=canvas.width/d,h=canvas.height/d;
      ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,w,h);ctx.fillStyle="#f7f7f5";ctx.fillRect(0,0,w,h);ctx.font="12px Lato";ctx.textAlign="center";ctx.fillStyle="#777";ctx.fillText("KV CACHE",w*.25,38);ctx.fillText("PLASTIC STATE",w*.75,38);
      const shown=Math.min(18,state.contextLength);for(let i=0;i<shown;i++){ctx.fillStyle=i%4===0?"#7f9fb9":"#b9b9b9";ctx.fillRect(w*.12,58+i*12,w*.11,7);ctx.fillStyle=i%4===0?"#252525":"#b9b9b9";ctx.fillRect(w*.27,58+i*12,w*.11,7)}
      const cell=Math.min(22,w*.045);for(let r=0;r<8;r++)for(let c=0;c<8;c++){const active=(r*8+c)%9===0||(r*8+c)%11===0;ctx.fillStyle=active?`rgba(37,37,37,${.22+state.trace*.78})`:"rgba(185,185,185,.2)";ctx.fillRect(w*.75-cell*4+c*cell,70+r*cell,cell-2,cell-2)}ctx.fillStyle="#777";ctx.fillText(`${state.contextLength} retained token pairs`,w*.25,h-28);ctx.fillText(`${Math.round(state.trace*100)}% trace in 64 cells`,w*.75,h-28);return;
    }
    const { tokens, fast } = current;
    while (tokens.children.length) tokens.remove(tokens.children[0]);
    const visible = Math.min(24, state.contextLength);
    for (let i = 0; i < visible; i += 1) {
      const key = slab(1.25, .12, .32, i % 4 === 0 ? blue : quiet);
      key.position.set(-.78, 2.45 - i * .22, 0); tokens.add(key);
      const value = slab(1.25, .12, .32, i % 4 === 0 ? ink : quiet);
      value.position.set(.78, 2.45 - i * .22, 0); tokens.add(value);
    }
    fast.children.forEach((cell, i) => {
      const active = i % 9 === 0 || i % 11 === 0;
      cell.material.color.copy(active ? ink : quiet);
      cell.material.opacity = active ? .22 + state.trace * .78 : .18;
      cell.scale.y = active ? 1 + state.trace * 6 : 1;
    });
  }, [state]);

  return <div className="scene" ref={host} role="img" aria-label={`Interactive comparison: ${state.contextLength} KV slots and a fixed 8 by 8 plastic matrix with ${Math.round(state.trace * 100)} percent trace strength. Drag to rotate and scroll to zoom.`}>
    <div className="scene-fallback" aria-hidden="true">
      <div className="fallback-system"><small>KV CACHE</small><div className="fallback-slots">{Array.from({ length: Math.min(12, state.contextLength) }, (_, i) => <i key={i} />)}</div><b>{state.contextLength}</b><span>token pairs retained</span></div>
      <div className="fallback-system"><small>PLASTIC STATE</small><div className="fallback-matrix">{Array.from({ length: 64 }, (_, i) => <i key={i} className={i % 9 === 0 || i % 11 === 0 ? "active" : ""} style={{ opacity: i % 9 === 0 || i % 11 === 0 ? .2 + state.trace * .8 : .16 }} />)}</div><b>{Math.round(state.trace * 100)}%</b><span>trace in 64 fixed cells</span></div>
    </div>
    <canvas ref={canvasRef} />
  </div>;
}

