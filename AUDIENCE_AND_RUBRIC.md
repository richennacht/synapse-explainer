# Synapse Explainer: Audience and High-Score Contract

## 1. Primary learner avatar

**Name:** Aanya, the model-curious data scientist

**Profile:** A final-year technical undergraduate, early graduate student, junior ML engineer, or working data scientist who has trained ordinary neural networks and used Transformer-based systems, but has not studied associative memory, fast weights, BDH, or computational neuroscience in depth.

**Situation:** Aanya has 8-12 minutes between sessions at an AI conference. She has heard that models can "learn in context," but does not have a mechanistic picture of where a temporary association lives or how conflicting demonstrations can disturb it.

**Motivation:** She wants an explanation she can manipulate, verify, and reuse when reading current architecture papers. She distrusts animations that are disconnected from the computation.

**Frustrations:** Dense notation without intuition; biological metaphors presented as proof; attention diagrams with no inspectable state; demos in which controls only trigger canned animation; unexplained claims about BDH or BDH-CQ.

**Accessibility assumptions:** Laptop or mobile browser; keyboard access may be required; reduced-motion mode and text equivalents must preserve the lesson; colour cannot be the only carrier of meaning.

## 2. Prerequisite knowledge

Aanya should already understand:

- A neural network contains units connected by weighted edges.
- A vector is an ordered list of numbers and a matrix can transform or store relationships between vectors.
- Training changes persistent model parameters; inference normally uses those fixed parameters.
- A demonstration is an input-output example supplied before a new test input.
- Accuracy means comparing a prediction with a known expected answer.

Aanya does **not** need:

- Neuroscience coursework or biological synapse models.
- Prior knowledge of Hebbian learning, fast weights, linear attention, recurrent memory, BDH, or BDH-CQ.
- Calculus derivations, backpropagation proofs, Python, WebGL, or shader programming.
- Familiarity with ARC-AGI beyond a short in-product explanation of a demonstration pair and held-out test.

## 3. One-sentence learning claim

**A temporary recurrent state can store a cue-action association from demonstrations without changing the model's slow trained parameters; strengthening, decay, and competing writes determine whether that association is recalled.**

This is the claim taught by the toy system. The artifact must not imply that the toy update is a faithful implementation of the full BDH or BDH-CQ architecture.

## 4. Learning objectives

After 8-12 minutes, the learner can:

1. Distinguish slow trained parameters from temporary within-session state.
2. Predict how one demonstration changes an inspectable association matrix.
3. Explain why repeated compatible demonstrations improve recall in the toy system.
4. Predict how decay or a conflicting demonstration changes recall.
5. Describe the conceptual role of Hebbian-style writes in BDH and the role of recurrent state in BDH-CQ skill acquisition.
6. State one limitation: the explainer is a reduced teaching model, not evidence that biological synapses and BDH-CQ are identical.

## 5. Sixty-second test

Give the learner a new cue, one compatible demonstration, and one conflicting demonstration. Ask:

1. Which internal quantity changed?
2. Was a slow parameter updated?
3. Which response should the system predict now, and why?
4. What would increasing decay do?

**Pass condition:** At least 3 of 4 answers are correct without reopening the explanation. The prediction and the expected answer must be shown side by side.

## 6. Guided learning journey

1. **Observe:** Start with a preset already running. Show fixed slow weights and an empty temporary association state.
2. **Write:** Add one cue-action demonstration. Animate only values produced by the actual update computation.
3. **Inspect:** Reveal the numeric matrix cell, connection strength, and equation term that changed.
4. **Test:** Apply the association to a held-out cue. Show predicted and expected outputs together.
5. **Interfere:** Add a competing mapping and let the learner predict the effect before running it.
6. **Vary:** Change only meaningful variables: write strength, retention/decay, and demonstration order.
7. **Connect:** Explain precisely how the toy mechanism relates to BDH and where BDH-CQ is similar or different.
8. **Evidence:** Place recent primary sources beside the claims they support and label developer-reported evidence separately from independent evidence.
9. **Sandbox:** Unlock free experimentation only after the guided path is completed.

## 7. Rubric checklist (100 points)

### Technical correctness and depth - 25 points

- [ ] Define slow parameters, recurrent state, association matrix, write, read, retention, decay, and interference.
- [ ] Publish the exact toy equations and define every symbol and range.
- [ ] Ensure every rendered edge, colour, pulse, and chart value is computed from the same live state.
- [ ] Show at least one numeric update step before and after a demonstration.
- [ ] Put expected output beside model output for every test.
- [ ] Separate direct paper claims, our inference, teaching simplification, and measured demo behaviour.
- [ ] Explain why the toy model is not the full BDH or BDH-CQ system.
- [ ] State numerical limits, caps, normalization, seeds, precision, and any precomputation.
- [ ] Include positive, conflicting, delayed, and capacity/failure cases.
- [ ] Verify equations, technical claims, citations, and visual mappings against primary sources.

### Technical ownership and live defense - 15 points

- [ ] Every teammate can state the central claim and limitation.
- [ ] The technical owner can trace UI input -> state update -> shader uniform -> visible output.
- [ ] The team can predict the result of changing each exposed control before running it.
- [ ] The team can identify live computation, precomputed data, synthetic examples, and decorative animation.
- [ ] Maintain a one-page architecture diagram and a five-minute live-defense script.
- [ ] Rehearse failure recovery: unavailable WebGL2, CDN failure, mobile layout, and reset.
- [ ] Disclose AI-assisted code, writing, design, generated imagery, and reused components.

### Learning effectiveness - 15 points

- [ ] Display the one-sentence claim near the beginning.
- [ ] State the primary learner and prerequisites explicitly.
- [ ] Present the six learning objectives in observable terms.
- [ ] Begin with a meaningful preset, not a blank canvas.
- [ ] Use guide-then-sandbox progression.
- [ ] Ask for a prediction before revealing the interference outcome.
- [ ] Run the sixty-second test with at least five representative learners.
- [ ] Record task completion, wrong-answer patterns, time, and qualitative confusion.
- [ ] Revise the explainer based on observed learner failures.

### Interactive substrate and honesty - 15 points

- [ ] At least one learner action changes a real input, parameter, state, example, or assumption.
- [ ] Target visible feedback below one second for every control.
- [ ] Restrict controls to write strength, retention/decay, interference/order, and reset unless another variable is educationally necessary.
- [ ] Expose the association matrix/state, not only decorative neurons.
- [ ] Keep a synchronized numeric view alongside WebGL/shader animation.
- [ ] Label decorative motion and teaching simplifications.
- [ ] Use deterministic seeds so judges can reproduce a run.
- [ ] Provide play, pause, step, replay, and reset.
- [ ] Ensure the experience still teaches when animation is reduced or WebGL is unavailable.

### BDH or BDH-CQ integration and evidence discipline - 10 points

- [ ] Include a substantive BDH/BDH-CQ chapter rather than a sponsor mention.
- [ ] Explain BDH's conceptual neuron-synapse model and Hebbian-style synaptic writes accurately.
- [ ] Explain BDH-CQ skill acquisition from demonstrations through recurrent state without claiming inference-time slow-weight updates.
- [ ] Use the BDH-CQ demonstration-learning example required by the brief.
- [ ] Compare the toy mechanism with the relevant BDH/BDH-CQ mechanism in a compact table.
- [ ] Cite primary sources beside technical claims.
- [ ] Include at least three recent primary papers from 2022-2026 that use, extend, test, or rely on the selected concept.
- [ ] Identify the most important missing evidence or unanswered question.

### Craft, robustness, accessibility, and provenance - 10 points

- [ ] Verify desktop, tablet, and mobile layouts.
- [ ] Provide keyboard navigation, visible focus, semantic labels, sufficient contrast, and non-colour cues.
- [ ] Honour `prefers-reduced-motion` and provide text/numeric equivalents.
- [ ] Show a useful loading state and an honest WebGL fallback.
- [ ] Eliminate broken links and test the public URL without sign-in.
- [ ] Keep first meaningful content fast; precompute expensive optional results.
- [ ] Provide exact setup and reproduction instructions.
- [ ] Record sources and licences for code, data, weights, fonts, graphics, shaders, and reused components.
- [ ] Add AI-assistance and generated-asset disclosures to the README.

### One-page concept summary - 10 points

- [ ] Deliver a readable, self-contained PDF of approximately 500-950 words.
- [ ] Write for an average data scientist encountering the idea for the first time.
- [ ] Include the claim, mechanism, motivation, BDH/BDH-CQ roles, evidence, and limitations.
- [ ] Compare two or three relevant architectures on meaningful dimensions.
- [ ] Distinguish benchmark results, developer reports, independent reproduction, deployment, and partnership evidence.
- [ ] State strengths, weaknesses, maturity, and competitive context.
- [ ] Use dense, mechanism-bearing prose; remove promotional padding and undefined buzzwords.
- [ ] Test whether a fresh reader can accurately restate the claim and ask an informed follow-up.

## 8. Required submission package

- [ ] Public artifact URL that opens without sign-in.
- [ ] Public source-code repository.
- [ ] Blog supplied as a PDF.
- [ ] One-page concept-summary PDF.
- [ ] Complete README.
- [ ] Setup instructions for every local or notebook component.
- [ ] Three or more recent primary papers from 2022-2026 with claim-adjacent citations.
- [ ] Source and licence record for code, data, weights, graphics, fonts, shaders, and reused components.
- [ ] AI assistance, code, data, asset, and licence disclosure.
- [ ] README labels for live, precomputed, synthetic, and animated components.
- [ ] Reproduction instructions and expected outputs.

## 9. High-valuation acceptance gates

Do not call the project submission-ready until all gates pass:

1. **Comprehension:** 4 of 5 representative learners pass at least 3/4 sixty-second questions.
2. **Honesty:** A reviewer can identify every live, precomputed, synthetic, and decorative component from the UI or README.
3. **Reproducibility:** A fresh browser reproduces the canonical run from a recorded seed and configuration.
4. **Latency:** Every core control gives visible feedback in under one second on the target laptop.
5. **Defense:** Every teammate can explain the claim; the technical owner can trace the full state/render pipeline.
6. **Evidence:** Every central technical claim has a nearby primary source or is explicitly labeled as our inference/toy behaviour.
7. **Access:** The public URL works without sign-in and the core lesson survives keyboard-only, reduced-motion, and WebGL-fallback modes.

## 10. Explicit exclusions for the MVP

- No claim that the toy system reproduces biological synaptic plasticity.
- No claim that it implements or validates the full BDH/BDH-CQ architecture.
- No general introduction to all memory architectures.
- No decorative controls without a model variable.
- No stochastic visual effect that changes the measured experiment.
- No animation presented as evidence.
- No training of a large model during the demo.

