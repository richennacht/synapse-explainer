"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const C = { ink: 0x222222, mid: 0x858585, pale: 0xd8d8d4, blue: 0x7693aa, paper: 0xf7f7f5 };

function box(w, h, d, color = C.pale, opacity = .94) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ color, transparent: true, opacity }));
  mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: C.mid, transparent: true, opacity: .55 })));
  return mesh;
}

function line(a, b, color = C.mid, opacity = .65) {
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
}

function stack(group, x, layers, accent = false) {
  const names = ["TOKENS", "EMBED", ...Array.from({ length: layers }, (_, i) => `BLOCK ${i + 1}`), "LOGITS"];
  names.forEach((name, i) => {
    const slab = box(i === 0 || i === names.length - 1 ? 3.1 : 3.7, .28, 2.25, accent && i > 1 && i < names.length - 1 ? C.blue : i % 2 ? C.pale : C.mid);
    slab.position.set(x, -2.5 + i * .63, 0); slab.userData.name = name; group.add(slab);
  });
  return names;
}

function buildOverview(scene) {
  const root = new THREE.Group(); scene.add(root);
  stack(root, -2.7, 4);
  stack(root, 2.7, 4, true);
  const memory = box(3.15, .5, 2.7, C.ink); memory.position.set(2.7, .63, -.2); root.add(memory);
  for (let i = 0; i < 5; i++) root.add(line(new THREE.Vector3(-.62, -1.85 + i * .63, 0), new THREE.Vector3(.62, -1.85 + i * .63, 0), C.pale, .9));
  return root;
}

function buildKv(scene) {
  const root = new THREE.Group(); scene.add(root);
  const tower = new THREE.Group(); root.add(tower); stack(tower, -2.8, 3);
  const cache = new THREE.Group(); cache.name = "cache"; root.add(cache);
  for (let i = 0; i < 12; i++) {
    const k = box(1.8, .12, .48, i % 3 ? C.pale : C.blue); k.position.set(1.55, 2.45 - i * .34, 0); k.userData.slot = i; cache.add(k);
    const v = box(1.8, .12, .48, i % 3 ? C.mid : C.ink); v.position.set(3.7, 2.45 - i * .34, 0); v.userData.slot = i; cache.add(v);
  }
  root.add(line(new THREE.Vector3(-.75, .2, 0), new THREE.Vector3(.45, .2, 0), C.ink));
  return root;
}

function buildHebbian(scene) {
  const root = new THREE.Group(); scene.add(root);
  const pairs = new THREE.Group(); pairs.name = "pairs"; root.add(pairs);
  for (let i = 0; i < 6; i++) {
    const pre = new THREE.Mesh(new THREE.SphereGeometry(.22, 18, 18), new THREE.MeshBasicMaterial({ color: i === 2 ? C.ink : C.pale })); pre.position.set(-3.2, 2.1 - i * .78, 0); root.add(pre);
    const post = new THREE.Mesh(new THREE.SphereGeometry(.22, 18, 18), new THREE.MeshBasicMaterial({ color: i === 4 ? C.blue : C.pale })); post.position.set(3.2, 2.1 - i * .78, 0); root.add(post);
    for (let j = 0; j < 6; j++) { const edge = line(new THREE.Vector3(-2.85, 2.1 - i * .78, 0), new THREE.Vector3(2.85, 2.1 - j * .78, 0), i === 2 && j === 4 ? C.ink : C.pale, i === 2 && j === 4 ? 1 : .16); edge.userData.active = i === 2 && j === 4; pairs.add(edge); }
  }
  return root;
}

function buildBdh(scene) {
  const root = new THREE.Group(); scene.add(root);
  const points = [];
  for (let i = 0; i < 30; i++) {
    const angle = i * 2.399;
    const radius = 1.1 + (i % 7) * .34;
    const p = new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, ((i * 13) % 9 - 4) * .16); points.push(p);
    const node = new THREE.Mesh(new THREE.SphereGeometry(i % 9 === 0 ? .24 : .13, 14, 14), new THREE.MeshBasicMaterial({ color: i % 9 === 0 ? C.ink : i % 5 === 0 ? C.blue : C.pale })); node.position.copy(p); root.add(node);
  }
  points.forEach((p, i) => { [1, 3, 8].forEach(step => { const j = (i + step) % points.length; const edge = line(p, points[j], (i + j) % 11 === 0 ? C.ink : C.pale, (i + j) % 11 === 0 ? .8 : .22); edge.userData.active = (i + j) % 11 === 0; root.add(edge); }); });
  return root;
}

const builders = { overview: buildOverview, kv: buildKv, hebbian: buildHebbian, bdh: buildBdh };

export default function ArchitectureViz({ mode, value = .5, label }) {
  const host = useRef(null); const canvasRef = useRef(null); const modelRef = useRef(null);
  useEffect(() => {
    const el = host.current; const canvas = canvasRef.current; const scene = new THREE.Scene(); scene.background = new THREE.Color(C.paper);
    const camera = new THREE.PerspectiveCamera(34, 1, .1, 100); camera.position.set(8.5, 6.5, 12); camera.lookAt(0, 0, 0);
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); } catch { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); const root = builders[mode](scene); modelRef.current = root;
    const resize = () => { const w = el.clientWidth, h = el.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    const ro = new ResizeObserver(resize); ro.observe(el); resize(); let raf; let yaw = 0; let drag = false; let last = 0;
    const down = e => { drag = true; last = e.clientX; canvas.setPointerCapture(e.pointerId); };
    const move = e => { if (!drag) return; yaw += (e.clientX - last) * .006; last = e.clientX; };
    const up = () => { drag = false; };
    canvas.addEventListener("pointerdown", down); canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerup", up);
    const draw = t => { root.rotation.y = yaw + Math.sin(t * .00022) * .055; renderer.render(scene, camera); el.dataset.ready = "true"; raf = requestAnimationFrame(draw); }; raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); canvas.removeEventListener("pointerdown", down); canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerup", up); };
  }, [mode]);
  useEffect(() => {
    const root = modelRef.current; if (!root) return;
    root.traverse(obj => {
      if (mode === "kv" && obj.userData.slot !== undefined) obj.visible = obj.userData.slot < Math.max(1, Math.round(value * 12));
      if ((mode === "hebbian" || mode === "bdh") && obj.userData.active && obj.material) obj.material.opacity = .2 + value * .8;
    });
  }, [mode, value]);
  return <figure className="architecture-viz" ref={host}><div className={`viz-fallback viz-${mode}`} aria-hidden="true"><span>{label}</span></div><canvas ref={canvasRef} /><figcaption>{label}<small>Drag the model to inspect its depth.</small></figcaption></figure>;
}

