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

`src/app.js` contains the currently published deterministic Canvas 2D teaching demonstrations. The opening classifier recomputes template-similarity scores from an editable 5 by 7 input and adds a bounded fast trace to the route for digit 2. `src/simulation.js` contains the separately tested cue-action memory equations. `src/renderer.js` is an experimental WebGL renderer retained in the repository, but it is not used by the published article.

## Evidence labels

- **Live:** every slider update, editable digit pixel, template-similarity score, fast-trace contribution, and displayed decision.
- **Synthetic:** digit templates, cue-action examples, and the 5 by 5 arrow pattern.
- **Illustrative:** node placement, connection routing, and staged views of matrix operations.
- **External:** Lato and linked primary papers.

This is a reduced teaching model. It does not implement the full BDH or BDH-CQ architecture, establish biological realism, or demonstrate general reasoning. AI assisted code, writing, and visual iteration; outputs were reviewed and deterministic state logic is covered by local tests. See `LICENSES.md` and `AUDIENCE_AND_RUBRIC.md`.

