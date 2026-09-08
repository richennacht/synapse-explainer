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

The published application now uses Next.js and React. `lib/memory.js` is the framework-independent source of truth for the bounded plastic trace and the KV-versus-fixed-state comparison. `components/MemoryScene.js` renders the same state as a Three.js scene, with a computed Canvas 2D fallback when WebGL is unavailable. The earlier prototype remains in `src/` for provenance but is not loaded by the Next.js application.

## Evidence labels

- **Live:** every slider update, editable digit pixel, template-similarity score, fast-trace contribution, and displayed decision.
- **Synthetic:** digit templates, cue-action examples, and the 5 by 5 arrow pattern.
- **Illustrative:** node placement, connection routing, and staged views of matrix operations.
- **External:** Lato and linked primary papers.

This is a reduced teaching model. It does not implement the full BDH or BDH-CQ architecture, establish biological realism, or demonstrate general reasoning. AI assisted code, writing, and visual iteration; outputs were reviewed and deterministic state logic is covered by local tests. See `LICENSES.md` and `AUDIENCE_AND_RUBRIC.md`.

## WebGL architecture

The scene adopts the persistent spatial comparison and guided-explainer architecture demonstrated by Brendan Bycroft's MIT-licensed `bbycroft/llm-viz`. This implementation is original Three.js code rather than copied GPT-specific renderer code. The GPT model, prose, branding, and assets are not reused. Synapse Explainer retains its own memory engine, equations, chapter content, monochrome visual system, and project assets.

