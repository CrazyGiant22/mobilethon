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

## Deploy on Zeabur

BuildForge is configured for [Zeabur](https://zeabur.com) static deployment via `zbpack.json` (`output_dir: dist`).

### Option A — GitHub (recommended)

1. Go to [zeabur.com](https://zeabur.com) and sign in
2. **Create Project** → **Deploy your source code**
3. Import `CrazyGiant22/mobilethon` and select the `main` branch
4. Zeabur auto-detects Vite, runs `npm run build`, and serves `dist/`
5. Open **Domains** in the service settings to get your live URL

### Option B — Zeabur CLI

```bash
npm install
npx zeabur@latest auth login
npx zeabur@latest deploy
```

SPA routing is handled via `public/_redirects` (copied to `dist` on build).

## Live demo (GitHub Pages)

Pushes to `main` also deploy automatically to GitHub Pages at:

https://crazygiant22.github.io/mobilethon/

