# Brag Plan: Plugin Catalog

## What is this app?
A backend-free single-page app that turns any Claude Code plugin marketplace into a searchable, click-to-install catalog — search 235 plugins by name/tag/keyword, select, and one click copies the exact install commands into your clipboard.

## The angle
The whole "app store" experience — search, filter, multi-select, install — with **zero backend and zero build**. It's one HTML file. The payoff shot is the install modal spitting out real, copy-pasteable `claude plugin install … --scope project` commands. The flex is restraint: no server, no framework, no sign-up — and it still feels like a polished store.

## Hook (first 2-3 seconds)
Ink-dark screen. The violet→purple gradient wordmark **"Plugin Catalog"** assembles, and one line snaps in and holds: **"235 plugins. No backend."** That contradiction is the hook.

## Key moments (the middle)
- The search bar: cursor types `security`, and the card grid filters live from a wall of plugins down to a handful (tag chips show counts: `security 13`).
- Selecting: cursor clicks two cards — each checkbox fills with the gradient, the card lights up with an accent ring, and the sticky cart slides up: **"2 selected · ready to install."**
- The payoff: the install modal rises and the monospace command block reveals the real commands; **"Copy to clipboard"** → toast **"Copied ✓."**

## Outro / punchline
Final line over the wordmark: **"Search. Select. Shipped."** → small sub: *"marketplace → your project, in one click."*

## User flow worth showing
entry → key action → result:
1. **Entry** — catalog loads: 235 plugins, gradient hero, search bar focused.
2. **Key action** — type `security`, grid filters; click 2 cards to select (checks fill, cart appears).
3. **Result** — click *Install selected →*, modal shows the exact `claude plugin install …@claude-plugins-official --scope project` commands; copy; toast confirms.

This is the centerpiece — show the working app, not a marketing diagram.

## Tone
- Preset: polished
- Creative direction: quiet premium developer-tool product film
- Interpretation: few scenes, longer holds, confidence through restraint; motion is smooth and deliberate, never busy. The product's own calm UI is the star.

## Format: landscape — 1920x1080
## Duration: ~19 seconds

## Visual identity (from the project)
- Background: `#0b0c12` (dark mode — use for hero/outro), `#f6f7fb` (light — use for the live-UI scenes)
- Accent: linear-gradient `#5b5bf0` → `#8b5cf6`
- Text: `#f3f4fa` on dark / `#14161f` on light
- Installed badge / success: `#18a558` (light) / `#3ddc84` (dark)
- Display font: system sans (-apple-system / "Segoe UI" / Roboto), weight 800, tight tracking (-0.02em)
- Body/mono font: ui-monospace / SF Mono (the command block)
- Strongest visual element: the gradient hero headline + the card grid filtering + the install modal's monospace command block with the "Copied ✓" toast.

## Share copy (draft)
Built a one-file, no-backend "app store" for Claude Code plugins — search 235 plugins, click, and the install commands land in your clipboard. 🧩

## Audio direction
- Role: warm low bed with sparse, tasteful professional accents
- Music: calm, confident electronic/ambient bed (think understated product-launch underscore); fade in over the hook, settle low under the UI scenes, soft resolve on the outro
- Music treatment: start ~0s at low volume, gentle swell into the install payoff, clean fade on the final wordmark
- Music cue guidance: track TBD at composition time — target one strong cue at the install-modal reveal (~13s) and a soft resolve on the outro (~17s); use `npx hyperframes beats` for a beat grid if sequential reveals need alignment
- Audio-reactive treatment: subtle — let the hero wordmark and the success toast carry a gentle presence with the music; no waveform bars
- SFX posture: sparse, motion-matched — soft key ticks on typing, a quiet "tick" on each card select, a soft whoosh on the cart slide-up, one clean confirmation chime on "Copied ✓"
- Audio-coupled moments: typed search query, card-by-card selection, cart slide-up, copy confirmation
- Restraint rule: no dense beat-mashing, no comedic SFX; the audio stays premium and gets out of the way of the UI

## Storyboard

### Scene 1 — Hook / wordmark — 3s
Ink-dark `#0b0c12` screen. The gradient wordmark "Plugin Catalog" assembles center; the line "235 plugins. No backend." snaps in beneath it and holds.
Sequential/interaction: none
Audio intent: warm bed fades in; a single soft presence under the wordmark
Audio-coupled idea: none
Music: calm confident bed, fade-in
Transition mood: soft crossfade → Scene 2

### Scene 2 — Live search — 5s
Cut to the light-mode app (real UI). Search bar focused; cursor types `security` with subtle key ticks. The card grid filters live from a full grid down to a handful; tag chips show counts (`security 13`). Hold long enough to read two card titles.
Sequential/interaction: yes — type the query character by character; cards re-flow as the filter narrows
Audio intent: quiet, focused; typing gives gentle rhythm
Audio-coupled idea: key ticks on each typed character
Music: low bed continues
Transition mood: soft slide → Scene 3

### Scene 3 — Select (centerpiece) — 5s
Cursor clicks two plugin cards. Each checkbox fills with the violet→purple gradient and the card gains an accent-ring glow. The sticky cart slides up from the bottom: "2 selected · ready to install."
Sequential/interaction: yes — two distinct card selects, one after another, each with a soft tick; cart slides up after the second
Audio intent: each selection feels tactile and satisfying; small lift as the cart appears
Audio-coupled idea: a quiet "tick" per card select; soft whoosh on the cart slide-up
Music: bed begins a gentle swell
Transition mood: smooth wipe → Scene 4

### Scene 4 — Install payoff + outro — 6s
Cursor clicks "Install selected →". The modal rises; the monospace command block reveals line by line:
`claude plugin marketplace add anthropics/claude-code`
`claude plugin install postman@claude-plugins-official --scope project`
Cursor hits "Copy to clipboard" → toast "Copied ✓." Crossfade to ink-dark outro: wordmark + "Search. Select. Shipped." / sub: "marketplace → your project, in one click."
Sequential/interaction: yes — modal rise, command lines reveal sequentially (hold the full block ~1.5s), copy click, toast
Audio intent: swell resolves on the command reveal; one clean confirmation chime on "Copied ✓"; soft fade on outro
Audio-coupled idea: subtle line-reveal ticks (every other beat) then hold; confirmation chime coupled to the toast
Music: swell → clean resolve → fade
Transition mood: soft crossfade → end

**Music mood for this video:** polished / calm-confident product underscore
**Audio summary:** A warm low bed fades in on the hook, stays quiet and focused under the typing and selection, swells gently into the install reveal, and resolves with a single clean confirmation before fading on the wordmark.
