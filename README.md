# Synapse Explainer

An interactive, evidence-labelled explainer of temporary synaptic-style memory and skill acquisition from demonstrations.

## Learning claim

A temporary recurrent state can store a cue-action association from demonstrations without changing slow trained parameters; strengthening, decay, and competing writes determine whether that association is recalled.

The primary learner is a technically literate undergraduate, early graduate student, junior ML engineer, or data scientist who understands neural-network weights, vectors, and demonstrations but has not studied fast weights or computational neuroscience.

## Run and test

The site has no build step. Serve this directory with any static web server and open `index.html`.

```sh
npm test
npx serve .
```

## Architecture

`src/simulation.js` is the deterministic source of truth. `src/app.js` connects controls, numeric state, KaTeX, and the Canvas 2D history chart. `src/renderer.js` sends the same state into raw WebGL2 uniforms and renders the network with GLSL ES 3.00 shaders. The renderer never determines the measured result.

## Evidence labels

- **Live:** state updates, recall decisions, matrix values, and history plot.
- **Synthetic:** cue/action examples and experiment history.
- **Illustrative:** graph layout, motion, additive glow, and pointer disturbance.
- **External:** KaTeX, Lato, and linked primary papers.

This is a reduced teaching model. It does not implement the full BDH or BDH-CQ architecture, establish biological realism, or demonstrate general reasoning. AI assisted code, writing, and visual iteration; outputs were reviewed and deterministic state logic is covered by local tests. See `LICENSES.md` and `AUDIENCE_AND_RUBRIC.md`.

