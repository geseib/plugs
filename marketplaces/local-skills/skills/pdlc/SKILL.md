---
name: pdlc
description: Orchestrate the product development lifecycle workflow (Product, Architecture, Build) with human decisions on local HTML pages. Use when the human says start, continue, resume, or asks where the workflow stands.
---

<!-- skill-version: v1 -->

# PDLC Orchestrator

Drive the three-phase workflow. `workspace/state.json` is the single source of truth;
this skill routes to the next step and executes it. Human gates use the
`pdlc-decision-page` skill; the CALM bundle uses the `pdlc-calm-bundle` skill.

## Step table

| # | step id | phase | action | gate |
|---|---------|-------|--------|------|
| 1 | `product-idea` | product | Capture the idea with the human in the CLI → `workspace/product/idea.md` | — |
| 2 | `product-prd` | product | Draft `workspace/product/prd.md` (Problem, Solution, Target users, Success metrics, MVP scope) | — |
| 3 | `product-prd-approval` | product | Decision page `prd-approval`; on changes-requested loop to #2 | human |
| 4 | `arch-proposal` | architecture | Draft `workspace/architecture/notes.md`: components, data flow, candidate technologies, which choice to put to the human | — |
| 5 | `arch-tech-choice` | architecture | Decision page `tech-choice` for the key technology decision | human |
| 6 | `arch-calm-bundle` | architecture | Produce the CALM bundle (use `pdlc-calm-bundle` skill) | — |
| 7 | `build-handoff` | build | Write `workspace/build/handoff.md`; mark workflow complete | — |

## Routing methodology

1. **Read `workspace/state.json`.** If it does not exist, this is a fresh start: create it with all seven steps `pending` (schema below), then begin step 1.

2. **Route mechanically:**
   - `currentStep` is `awaiting-human` → read `workspace/decisions/<currentStep>.json`.
     - Exists with `decidedAt` → process the decision (below), then advance.
     - Missing → re-print `http://localhost:4173` and end your turn. Do not advance.
   - `currentStep` is `in-progress` → resume that step's action.
   - Otherwise → set the next `pending` step to `in-progress` and execute it.

3. **Execute non-gated steps inline.** Write the artifact, set the step `done`, record artifact paths in the step's `artifacts`, update `updatedAt`, and continue immediately to the next step — only human gates pause the workflow.

4. **Execute gated steps** (3 and 5) with the `pdlc-decision-page` skill, then end your turn after printing the link.

5. **Process decisions:**
   - `product-prd-approval` → `approved`: step done, proceed. `changes-requested`: revise **only** the sections named in `comments[]` (plus `freeform`), reset step 3 to `pending`, re-run the approval gate with the revised PRD.
   - `arch-tech-choice` → record outcome; the choice, reasons, and freeform feed the ADR in step 6.

6. **Finish.** After step 7, tell the human the workflow is complete and point to `workspace/build/handoff.md` and the CALM bundle.

## state.json schema

```json
{
  "project": "meeting-cost-ticker",
  "currentStep": "arch-tech-choice",
  "currentPhase": "architecture",
  "steps": [
    {
      "id": "product-idea",
      "phase": "product",
      "status": "done",
      "artifacts": ["workspace/product/idea.md"]
    }
  ],
  "updatedAt": "2026-06-10T12:00:00Z"
}
```

`status`: `pending | in-progress | awaiting-human | done`. All seven steps are always present in order.

## handoff.md contents (step 7)

A build team (or build agent) should be able to start spec-driven development from this file alone. Include: link to the PRD; link to `architecture.json` and each ADR; the resolved technology choices with the human's rationale; explicit MVP scope boundaries (what is out); suggested first specs to write.

## Anti-patterns

- **DO NOT** advance past a human gate without reading a decision file containing `decidedAt`.
- **DO NOT** regenerate the whole PRD on changes-requested — revise only the commented sections.
- **DO NOT** edit `state.json` without refreshing `updatedAt`.
- **DO NOT** skip steps or reorder the table, even if a step seems trivial for the project at hand.
- **DO NOT** make the key technology choice yourself — recommend, but the human decides on the page.
