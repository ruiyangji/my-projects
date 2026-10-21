# My Projects

An interactive portfolio piece comparing architectural choices in browser automation and reinforcement-learning-based cluster scheduling.

The homepage includes a five-mode walkthrough. Select **Take the 5-mode tour** in the hero to see where the visual, aural, gestural, spatial, and linguistic interactions are located.

## Run locally

```sh
npm install
npm run dev
```

Create a production build with `npm run build`.

## What is included

- Project selector with technical stacks, design trade-offs, and expandable engineering rationales.
- Trace2Code pipeline with an animated compile walkthrough.
- RL cluster visualizer with a draggable 3D canvas, scale controls, and animated traffic.
- Task-placement sandbox comparing hard action masking with a reward-penalty baseline.
- Browser-generated audio overview and responsive, keyboard-accessible controls.

The 3D scene and task-placement lab are explanatory illustrations. They do not execute the original browser compiler or a trained scheduling policy. Reported benchmark figures should be checked against project records before publication.

## Publish

The GitHub Actions workflow in `.github/workflows/deploy.yml` builds the Vite site and deploys `dist/` to GitHub Pages on pushes to `main`. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.
