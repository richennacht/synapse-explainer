const VERTEX_SHADER = `#version 300 es
precision highp float;
in vec2 a_position;
in float a_kind;
in float a_path;
uniform float u_time;
uniform float u_memory;
uniform float u_interference;
uniform vec2 u_pointer;
out float v_kind;
out float v_path;
out float v_energy;
void main() {
  vec2 p = a_position;
  float wave = sin(u_time * 0.72 + p.x * 7.0 + p.y * 5.0) * 0.008;
  p += vec2(wave, cos(u_time * 0.54 + p.y * 6.0) * 0.007);
  float d = distance(p, u_pointer);
  if (d < 0.32) p += normalize(p - u_pointer + vec2(0.001)) * (0.32 - d) * 0.11;
  gl_Position = vec4(p, 0.0, 1.0);
  gl_PointSize = mix(1.0, 11.0 + 13.0 * u_memory + 4.0 * sin(u_time * 2.0 + p.x * 8.0), a_kind);
  v_kind = a_kind;
  v_path = a_path;
  v_energy = clamp(u_memory - 0.55 * u_interference, 0.05, 1.0);
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;
in float v_kind;
in float v_path;
in float v_energy;
uniform float u_interference;
out vec4 out_color;
void main() {
  vec3 teal = vec3(0.0, 0.73, 0.60);
  vec3 yellow = vec3(1.0, 0.87, 0.0);
  vec3 violet = vec3(0.51, 0.15, 0.53);
  vec3 base = mix(teal, yellow, v_path * v_energy);
  base = mix(base, violet, u_interference * (0.35 + 0.65 * v_path));
  if (v_kind > 0.5) {
    float radius = distance(gl_PointCoord, vec2(0.5));
    float alpha = 1.0 - smoothstep(0.12, 0.49, radius);
    if (alpha < 0.01) discard;
    out_color = vec4(base + (1.0 - radius) * 0.22, alpha);
  } else {
    out_color = vec4(base, 0.10 + v_energy * (0.25 + 0.60 * v_path));
  }
}`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
}

export function createSynapseRenderer(canvas, options = {}) {
  const gl = canvas.getContext("webgl2", { antialias: true, alpha: false });
  if (!gl) throw new Error("WebGL2 unavailable - numeric simulation remains active.");
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));

  const layers = [
    [[-.86,.44],[-.88,0],[-.84,-.45]],
    [[-.47,.66],[-.5,.24],[-.5,-.22],[-.46,-.65]],
    [[-.06,.54],[-.05,.16],[-.05,-.2],[-.02,-.56]],
    [[.38,.65],[.42,.23],[.42,-.22],[.38,-.65]],
    [[.82,.4],[.85,0],[.82,-.42]]
  ];
  const vertices = [];
  let edgeCount = 0;
  layers.slice(0,-1).forEach((layer, layerIndex) => {
    layer.forEach((a, ai) => layers[layerIndex+1].forEach((b, bi) => {
      const path = ((ai + bi + layerIndex) % 3 === 0) ? 1 : 0;
      vertices.push(a[0],a[1],0,path,b[0],b[1],0,path);
      edgeCount += 2;
    }));
  });
  const nodes = layers.flat();
  nodes.forEach((node,index) => vertices.push(node[0],node[1],1,index%3===0?1:0));
  const data = new Float32Array(vertices);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  const stride = 16;
  [["a_position",2,0],["a_kind",1,8],["a_path",1,12]].forEach(([name,size,offset]) => {
    const location = gl.getAttribLocation(program,name);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location,size,gl.FLOAT,false,stride,offset);
  });
  const uniforms = Object.fromEntries(["time","memory","interference","pointer"].map(name => [name,gl.getUniformLocation(program,`u_${name}`)]));
  let state = { memoryStrength:0, interference:0 };
  let pointer = [5,5];
  let running = true;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  canvas.addEventListener("pointermove", event => {
    const rect = canvas.getBoundingClientRect();
    pointer = [(event.clientX-rect.left)/rect.width*2-1, -((event.clientY-rect.top)/rect.height*2-1)];
  });
  canvas.addEventListener("pointerleave", () => { pointer=[5,5]; });

  function draw(milliseconds=0) {
    const scale = Math.min(devicePixelRatio || 1,2);
    const width = Math.max(1,Math.round(canvas.clientWidth*scale));
    const height = Math.max(1,Math.round(canvas.clientHeight*scale));
    if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
    gl.viewport(0,0,width,height);
    gl.clearColor(.006,.012,.01,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    gl.useProgram(program);
    gl.uniform1f(uniforms.time,reduced?0:milliseconds/1000);
    gl.uniform1f(uniforms.memory,state.memoryStrength);
    gl.uniform1f(uniforms.interference,state.interference);
    gl.uniform2fv(uniforms.pointer,pointer);
    gl.drawArrays(gl.LINES,0,edgeCount);
    gl.drawArrays(gl.POINTS,edgeCount,nodes.length);
    if(running) requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
  return { update(next){state=next;}, pause(){running=false;}, play(){if(!running){running=true;requestAnimationFrame(draw);}} };
}

