# Hyperframes Composition Brief: Plugin Catalog

## Objective
Create a short, polished launch-style brag video for the Plugin Catalog — a one-file,
no-backend "app store" for Claude Code plugins.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: ~19 seconds (4 scenes: 3 + 5 + 5 + 6)

## Source Material
- Project root: `/Users/georgeseib/Documents/projects/plugs`
- Primary files read: `index.html` (the catalog SPA), `data.js`, `brag-output/brag-plan.md`
- Product name: **Plugin Catalog**
- Tagline / strongest claim: **"235 plugins. No backend."**
- Key UI to recreate (faithfully, from the real `index.html`):
  - Gradient wordmark hero on ink-dark `#0b0c12`
  - Light-mode catalog: focused search bar + card grid that filters live
  - Card selection: gradient-filled checkbox + accent ring + sticky cart
  - Install modal with a monospace command block + "Copied ✓" toast
- Copy that must appear verbatim:
  - "Plugin Catalog"
  - "235 plugins. No backend."
  - "2 selected · ready to install"
  - `claude plugin marketplace add anthropics/claude-code`
  - `claude plugin install postman@claude-plugins-official --scope project`
  - "Copied ✓"
  - "Search. Select. Shipped."
  - "marketplace → your project, in one click."

## Creative Direction
- Tone preset: **polished**
- Creative direction: quiet premium developer-tool product film
- Interpretation: few scenes, longer holds, confidence through restraint. Motion is smooth
  and deliberate, never busy. The product's own calm UI is the star. No comedy, no flashing.
- Angle: The whole "app store" experience — search, filter, multi-select, install — with
  zero backend and zero build. The flex is restraint: one HTML file that still feels like a
  polished store. Payoff = the install modal emitting real, copy-pasteable commands.
- Hook (first 3s): ink-dark screen, gradient "Plugin Catalog" wordmark assembles, and
  "235 plugins. No backend." snaps in and holds — the contradiction is the hook.
- Outro / punchline: "Search. Select. Shipped." over the wordmark, sub "marketplace → your
  project, in one click."
- Avoid: generic SaaS language, abstract filler visuals, redesigning the product.

## Visual Identity (exact values from the project)
- Dark bg (hero/outro): `#0b0c12`; dark surface `#151723`; dark text `#f3f4fa`
- Light bg (UI scenes): `#f6f7fb`; surface `#ffffff`; border `#e6e8f0`; text `#14161f`;
  soft text `#565d72`; faint `#8a90a6`
- Accent gradient: `linear-gradient(135deg, #5b5bf0, #8b5cf6)`
- Success: `#18a558` (light) / `#3ddc84` (dark)
- Display font: system sans (-apple-system / "Segoe UI" / Roboto), weight 800, tracking -0.02em
- Mono font: ui-monospace / "SF Mono" (the command block, version chips)
- Strongest visual: gradient hero headline; card grid filtering; install modal's monospace
  command block with the "Copied ✓" toast.

## Storyboard
Source of truth: `brag-output/brag-plan.md`.

Scene summary:
1. Hook / wordmark — 3s — ink-dark, gradient "Plugin Catalog" + "235 plugins. No backend."
2. Live search — 5s — light catalog, type `security`, grid filters live (tag chip `security 13`)
3. Select (centerpiece) — 5s — click 2 cards (gradient checks + ring), cart slides up
4. Install payoff + outro — 6s — modal rises, monospace commands reveal, "Copied ✓", outro

## Audio
- Audio role: warm low bed with sparse, tasteful professional accents
- Audio arc: bed fades in on the hook, stays quiet under typing/selection, swells gently into
  the install reveal, resolves with one clean confirmation, fades on the wordmark.
- Music: `assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` (polished pick),
  volume 0.30, fade-in over the hook, soft fade on the outro.
- Music cue guidance: preset JSON at
  `assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json`.
  Strong cues in window: 8.74, 9.29, 10.93, **13.11**, **17.47**, 18.56, 19.66, 22.37.
  Lock the install-modal rise to **13.11s** and the outro crossfade to **17.47s**.
  Beat grid available for snapping the typed query and card selects.
- Audio-reactive treatment: subtle — let the hero wordmark glow and the install modal's
  presence breathe gently with the music RMS/bass. No waveform/equalizer visuals.
- Audio-coupled moments:
  - Scene 2 typed query — randomized `keyboard/keypress-*.wav` per character (soft)
  - Scene 3 card selects — a quiet `interface/drop_001.ogg` tick per card
  - Scene 3 cart slide-up — soft `impact/impactSoft_medium_000.ogg`
  - Scene 4 modal rise — soft `interface/bong_001.ogg` accent on the 13.11s cue
  - Scene 4 copy confirm — one clean `impact/impactBell_heavy_000.ogg` chime on "Copied ✓"
- SFX volume policy: polished/soft — keypresses ~0.30, drop ~0.45, soft impact ~0.45,
  bong ~0.40, bell ~0.55. Music bed at 0.30. Nothing above 0.6.
- Audio files copied into `assets/` (music, keyboard, interface, impact).

## Hyperframes Instructions
- Standalone single composition (no sub-comps) — all 4 scenes on one root timeline.
- Recreate at least one real UI faithfully (the catalog scenes use the project's exact CSS).
- Keep all text readable: short labels hold ≥0.8s, command lines reveal then hold ~1.5s.
- Total duration 19s.
- Entrances on every scene element; transitions (crossfade/slide) handle scene exits — no
  exit tweens except the final outro fade.
- 1–3 strong beat locks only (modal rise @13.11, outro @17.47); typed chars + selects snap
  to the beat grid where it doesn't hurt readability.
- Deterministic only (seeded PRNG if needed); music muted-video rules N/A (no video).
- Run lint + validate + inspect before render.
