# “How I build” multimodal content design

## Intent

Create an original portfolio section that helps startup founders, hiring teams, and potential funders see how Jerry approaches engineering decisions. Demonstrate a working characteristic through project evidence: turning important constraints into dependable system behavior and making product tradeoffs clear.

## Rhetorical situation

- **Audience:** people evaluating Jerry for a high-agency role or a conversation about a technical product.
- **Social action:** help a visitor recognize evidence of product-minded technical judgment and invite a follow-up conversation.
- **Context:** a React portfolio currently presents Trace2Code and an RL cluster scheduler. It already includes architecture comparisons, an audio overview, and a 3D scheduler visualization. This section should connect the engineering choices to the people and teams who benefit from them.

## Content concept

**Working title:** “How I build: make the constraint part of the design.”

An interactive, two-case story reveals one consistent decision habit across different systems. The visitor chooses a case—repeating a browser workflow or allocating work to a cluster—and follows the same visual sequence:

`Product pressure → constraint → design choice → evidence → tradeoff`

### Case A: Repeat a browser workflow

- **Pressure:** repeated browser work should be predictable and fast to run.
- **Constraint:** avoid model calls during each workflow execution.
- **Design choice:** interpret the demonstration and compile a Playwright workflow ahead of execution.
- **Evidence:** the portfolio describes zero runtime LLM tokens as an architectural guarantee.
- **Tradeoff:** compilation takes work up front and the resulting workflow is less open-ended than a runtime agent.
- **Startup relevance:** predictable execution latency and no runtime model-token spend for the compiled workflow.

### Case B: Allocate cluster resources safely

- **Pressure:** workloads must fit available machine capacity.
- **Constraint:** an infeasible placement should not be selected.
- **Design choice:** mask invalid actions before policy sampling.
- **Evidence:** the portfolio reports 40% faster training convergence and zero hardware constraint violations during deployment.
- **Tradeoff:** the policy explores a smaller action space.
- **Startup relevance:** hardware limits are enforced as part of system behavior rather than left to a learned penalty.

Use “reported project result” for empirical figures and verify them against project records before publication. Keep the two examples visibly separate so readers do not infer that the scheduler’s measured outcomes apply to Trace2Code.

## Visitor experience

1. A short first-person opening states the working principle in plain language.
2. Two keyboard-accessible tabs let visitors pick a project case.
3. A custom animated diagram highlights each step in the decision sequence. A “Show the tradeoff” control reveals the alternative and its consequence.
4. A “Why a startup team cares” note translates the engineering outcome into product terms, without inventing dollar savings or user counts.
5. A closing line connects the examples to Jerry’s working style and offers a portfolio contact link.
6. An optional 45–60 second narration, recorded by Jerry, follows the same sequence. Captions/transcript remain available whether or not audio is played. The two case paths should take about two minutes to explore.

Suggested opening copy, subject to Jerry’s revision: **“I look for the constraint a product cannot afford to violate, then design the system so that requirement is visible and testable.”**

## Modes and original work

- **Visual:** an original two-case decision map with animated state changes, designed for this portfolio.
- **Spatial and gestural:** visitors select a case and reveal the chosen design or tradeoff using mouse, touch, or keyboard.
- **Linguistic:** first-person narration, concise case explanations, labels, and a transcript.
- **Aural:** optional first-person voice recording by Jerry.

The cases, explanations, visual map, interaction, and recording are the content. Astryx provides accessible React controls and status components as UI scaffolding; the original story and visual treatment are designed for this portfolio.

## Design and implementation direction

- Embed as one self-contained section in the existing portfolio, with a direct navigation link and matching design language.
- Use Astryx React components for tabs, buttons, and status/badge patterns where they fit; customize them to the existing visual identity. The portfolio already uses React 19 and Tailwind CSS.
- Keep the diagram readable without motion; support reduced motion, visible focus, clear selected states, and a text equivalent for every visual state.
- Keep the section useful without audio. Do not autoplay narration.

## Goals and limits

- Show a characteristic through two concrete examples rather than a résumé-style list of traits.
- Make the practical reason for each decision clear to a startup audience.
- Preserve the evidence labels and project-specific limits already used elsewhere on the site.
- Do not imply that the interactive diagrams run the original compiler or trained policy.
- Do not invent ROI, customer adoption, funding outcomes, or personal contributions that Jerry has not confirmed.

## GAI and authorship

The assignment’s GAI policy was not included in the materials reviewed so far. Before treating suggested first-person copy or generated implementation as submission-ready, check that policy and follow any disclosure requirements. Jerry should revise the first-person language and record the narration in his own voice so the final piece reflects his experience and authorship.

## Approaches considered

1. A decision map across both projects: broad evidence of a consistent working style, but can feel abstract on its own.
2. A deep Trace2Code case: concrete product relevance, but narrower evidence of working style.
3. A narrated personal statement: personal and aural, but relies more on claims than evidence.

The design combines the decision map and concrete cases, with optional narration. This keeps the focus on Jerry while grounding the characteristic in project evidence.
