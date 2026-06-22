# ▶ Status — launch video DONE ✅

The brag launch video is rendered. This file is now a record of what shipped.

## What's done
- ✅ **Plugin Catalog SPA** built and browser-verified: `index.html` + generated `data.js`
  (currently the 235-plugin `claude-plugins-official` marketplace as demo data).
- ✅ **Scanner** `scripts/scan.mjs` — turns any plugin repo into `data.js`.
- ✅ **Skill** `.claude/skills/plugin-catalog/` — scans a repo + can run installs.
- ✅ **brag** plugin installed (`brag@brag`, user scope).
- ✅ **brag storyboard**: `brag-output/brag-plan.md` (polished, ~19s).
- ✅ **Launch video RENDERED**: `brag-output/brag.mp4` — 1920×1080, 19s, with music + SFX.
  5 scenes: hook → live search → multi-select → install modal → outro.
- ✅ **Composition source**: `brag-output/composition/` (HyperFrames project, lint/inspect clean).
- ✅ **Share copy**: `brag-output/share-copy.txt` (canonical) + `share-copy-variants.md`.

## How it was built (for reference / re-rolls)
- Node 22 was already installed via Homebrew but **not linked**. Use it without linking:
  ```bash
  export PATH=/opt/homebrew/opt/node@22/bin:$PATH   # node v22.23.0
  ```
- HyperFrames skills are installed locally at `.agents/skills/` (via `npx hyperframes skills`).
- Re-render or iterate from the composition dir:
  ```bash
  cd brag-output/composition
  npx hyperframes preview                 # live studio (scrub/play) at localhost
  npx hyperframes lint && npx hyperframes inspect
  npx hyperframes render --quality high --output ../brag.mp4
  ```

## See / test it locally
- **The video**: open `brag-output/brag.mp4` (or `open brag-output/brag.mp4`).
- **Scrub it interactively**: the HyperFrames studio (`npx hyperframes preview` in
  `brag-output/composition/`) — play, scrub the timeline, tweak.
- **The catalog app itself**: open `index.html` directly — it runs on `file://` (no server).

## Other things I can do next (optional)
- Point the scanner at one of YOUR plugin repos to populate the real catalog:
  `node scripts/scan.mjs <path-or-owner/repo> --source <owner/repo>`
- Set up GitHub Pages deploy for `index.html` + `data.js`.

## Key files
| File | Purpose |
|------|---------|
| `index.html` | Self-contained catalog SPA |
| `scripts/scan.mjs` | Repo → `data.js` generator |
| `data.js` | Generated catalog data |
| `.claude/skills/plugin-catalog/SKILL.md` | Scan + install skill |
| `brag-output/brag-plan.md` | Video storyboard (ready for `/brag`) |
| `brag-output/share-copy.txt` | Launch copy |
| `README.md` | Full usage + deploy docs |
