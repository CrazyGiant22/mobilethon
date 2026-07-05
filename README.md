# BuildForge

A data-driven web app for PC builders and hardware enthusiasts who want to optimize their setups without guessing.

## Features

- **Component picker** — Curated database of CPUs, GPUs, motherboards, RAM, storage, PSUs, coolers, and cases
- **Compatibility checks** — Socket matching, RAM type, cooler TDP, GPU/case clearance, radiator fit
- **Bottleneck analysis** — CPU/GPU balance scoring with utilization estimates and plain-language verdicts
- **Power estimation** — System draw calculation with PSU headroom recommendations
- **Performance profiling** — Gaming and productivity scores with tier classification
- **Smart recommendations** — Prioritized upgrade suggestions based on your actual build
- **Saved builds** — Save and load up to 20 builds to browser local storage
- **Component comparison** — Side-by-side spec, score, and value comparison for CPUs, GPUs, RAM, and more
- **Quick-start presets** — 1080p, 1440p, and 4K enthusiast templates to explore instantly

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for production

```bash
npm run build
npm run preview
```

## Tech stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4

## How it works

BuildForge analyzes your selected components in real time:

1. **Compatibility engine** validates physical and electrical constraints between parts
2. **Bottleneck analyzer** compares CPU and GPU performance scores to estimate gaming balance
3. **Power calculator** sums TDP + GPU draw with 30% headroom for PSU sizing
4. **Recommendation engine** suggests targeted upgrades based on detected imbalances

No account required. All analysis runs locally in your browser.

## Deploy on Vercel

BuildForge is configured for [Vercel](https://vercel.com) via `vercel.json` (Vite build, SPA rewrite to `index.html`).

```bash
npm install
npx vercel@latest deploy --prod
```

Or import the GitHub repo in the Vercel dashboard — it auto-detects Vite and deploys on every push to `main`.
