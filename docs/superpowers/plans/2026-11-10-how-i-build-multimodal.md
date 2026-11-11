# “How I build” Multimodal Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local-only portfolio section that demonstrates Jerry’s constraint-driven engineering judgment with two interactive, evidence-labeled project stories.

**Architecture:** Build a focused React component for the two case paths and embed it in the existing one-page portfolio. Use Astryx `TabList` and `Button` as accessible UI primitives; author the diagram and story content in the project and keep its dark Tailwind styling consistent with the current site.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, Astryx `@astryxdesign/core` v0.7.13, `@stylexjs/stylex`, and `@astryxdesign/theme-neutral`.

**Spec:** `docs/superpowers/specs/2026-11-10-how-i-build-multimodal-design.md`

## Global Constraints

- Show the principle through project evidence: turning important constraints into dependable system behavior and making product tradeoffs clear.
- Keep the cases visibly separate and label the scheduler figures as reported project results.
- Do not invent ROI, customer adoption, funding outcomes, or personal contributions.
- Do not imply the diagrams execute the original compiler or trained policy.
- Provide visual, spatial/gestural, and linguistic modes; keep all content understandable without audio.
- Support keyboard controls, visible focus, reduced motion, and text equivalents for visual states.
- Keep the current deployed site unchanged; do not push, publish, or alter deployment configuration.

## Review Focus

- Keyboard-only case switching: each case is selectable and the selected state is announced.
- Reduced-motion preference: the diagram remains readable and state changes do not depend on animation.
- Narrow viewport: the diagram and case content remain legible without horizontal overflow.
- Evidence accuracy: +40% convergence and zero violations appear only in the scheduler story and carry a reported-result label.
- Interaction clarity: the visitor can see what the section is about, why it matters to a startup, and what each control does before interacting.

---

### Task 1: Add the Astryx-backed interactive story component

**Files:**
- Create: `src/components/ConstraintStory.tsx`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: project evidence already stated in `ArchitecturalDecisions.tsx` and the approved design spec.
- Produces: default export `ConstraintStory(): JSX.Element`, with an `id="how-i-build"` section and accessible interactive case selection.

- [x] Add `@astryxdesign/core@0.7.13`, `@stylexjs/stylex`, and `@astryxdesign/theme-neutral` to dependencies; retain the existing React 19 and Vite setup.
- [x] Configure the Tailwind v4/Astryx CSS layer order and imports in `src/index.css` following Astryx’s Tailwind styling guide.
- [x] Implement the component with Astryx `TabList` for the two project cases and Astryx `Button` for “Show the tradeoff”; use a custom original SVG/CSS diagram for `Product pressure → constraint → design choice → evidence → tradeoff`.
- [x] Add case copy for Trace2Code (zero runtime LLM tokens as an architectural guarantee) and the scheduler (+40% convergence and zero deployment violations, labeled as reported results), including project-specific tradeoffs and startup relevance.
- [x] Add first-person opening and a close that links to the existing contact path if one exists; otherwise link to the current portfolio’s relevant section without inventing contact details.
- [x] Respect `prefers-reduced-motion`; expose the same stage information as visible text; ensure state changes work through Astryx controls and keyboard input.

**Manual review:** inspect both case states, expanded tradeoff, keyboard focus, reduced-motion presentation, and a narrow-width layout in source/UI review. Do not add automated tests in this task.

### Task 2: Embed and navigate to the new content

**Files:**
- Modify: `src/App.tsx`
- Modify: `README.md`

**Interfaces:**
- Consumes: `ConstraintStory` from Task 1.
- Produces: a portfolio navigation link to `#how-i-build` and one embedded section after the existing project analysis, plus README documentation of the new authored content.

- [x] Import and render `ConstraintStory` in the main page after the project analysis and before the existing “How to read this work” section.
- [x] Add a concise navigation link labeled “How I build” targeting `#how-i-build`.
- [x] Update README’s content inventory to describe the two-case interactive story and its modes, while retaining the existing statement that illustrative diagrams do not execute the production systems.
- [x] Review the final local diff against every Global Constraint and the five Review Focus items; do not push or publish.
