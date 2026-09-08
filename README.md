# Synapse Explainer

An interactive, evidence-labelled explainer of temporary synaptic-style memory and skill acquisition from demonstrations.

## Learning claim

A temporary recurrent state can store a cue-action association from demonstrations without changing slow trained parameters; strengthening, decay, and competing writes determine whether that association is recalled.

The primary learner is a technically literate undergraduate, early graduate student, junior ML engineer, or data scientist who understands neural-network weights, vectors, and demonstrations but has not studied fast weights or computational neuroscience.

## Run and test

Install dependencies, then run the Next.js development server.

```sh
npm test
npm run dev
```

## Architecture

The application uses Next.js and React. `lib/memory.js` is the framework-independent source of truth for the bounded plastic trace and KV-versus-fixed-state comparison. `components/ArchitectureViz.js` renders four small Three.js explainers: the model-stack comparison, KV-cache growth, a Hebbian connection update, and a BDH-style particle graph. The earlier prototype remains in `src/` for provenance but is not loaded by the Next.js application.

## Evidence labels

- **Live:** every slider update, editable digit pixel, template-similarity score, fast-trace contribution, and displayed decision.
- **Synthetic:** digit templates, cue-action examples, and the 5 by 5 arrow pattern.
- **Illustrative:** node placement, connection routing, and staged views of matrix operations.
- **External:** Lato and linked primary papers.

This is a reduced teaching model. It does not implement the full BDH or BDH-CQ architecture, establish biological realism, or demonstrate general reasoning. AI assisted code, writing, and visual iteration; outputs were reviewed and deterministic state logic is covered by local tests. See `LICENSES.md` and `AUDIENCE_AND_RUBRIC.md`.

## WebGL architecture

The model scenes adapt the block-stack, spatial tensor, camera, and data-flow visual vocabulary demonstrated by Brendan Bycroft's MIT-licensed `bbycroft/llm-viz`. The implementation is original Three.js code and is limited to model-visualization primitives. The article, controls, BDH graph, equations, monochrome design, and teaching sequence are specific to Synapse Explainer.

