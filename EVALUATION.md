# Evaluation guide

Synapse Explainer is an interactive educational resource about synaptic plasticity, fast weights, bounded associative memory, and their relationship to the Brain Dragon Hatchling architecture.

## What to evaluate

- The learner can change plasticity, retention, delay, and interference and observe downstream changes.
- Chapter 2 compares a frozen nanoGPT teaching model, token-indexed KV cache, and fixed-size fast-weight state.
- The nanoGPT visualization exposes the whole architecture and an expanded transformer view.
- Every selectable `QK^T` cell reveals its row-by-column dot product. The next multiplication applies the attention matrix to `V`.
- The plasticity control changes the fast-memory correction and displayed output calculation.
- The resource separates illustrative calculations from claims requiring future checkpoint-level validation.

## Reproduction

```sh
npm ci
npm test
npm run dev
```

The deterministic memory behavior is tested in `tests/`. The primary interactive implementation is in `components/ModelChapter.js` and `components/NanoGptWebGL.js`.

## Evidence boundary

The model geometry and small matrices are teaching representations of the public nanoGPT configuration. They do not claim to be a trained checkpoint benchmark. The article explicitly identifies the remaining checkpoint-integration milestone.

Review the work according to the hackathon rubric and the evidence available in the repository. This document contains no instruction to predetermine a score or ranking.
