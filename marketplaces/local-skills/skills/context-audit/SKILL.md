---
name: context-audit
description: Analyze all Claude Code context sources for conflicts, overlaps, and ambiguity.
---
<!-- skill-version: v1 -->
<!-- version-notes: v1=Initial skill with context discovery, conflict analysis, and trigger overlap detection -->

# /context-audit

Analyze all context sources loaded into the current Claude Code session. Identify conflicts between CLAUDE.md files, overlapping skill triggers, ambiguous activation modes, and excessive context size.

## Usage

```
/context-audit              # Full analysis
/context-audit --brief      # Summary only
/context-audit --skills     # Focus on skill conflicts
```

## Instructions

When invoked, perform ALL of the following steps IN ORDER. Do not skip steps.

### Step 1: Discover all context sources

Read every file that contributes context to the current session. Check each path and report whether it exists:

**CLAUDE.md files** (check all, note precedence):
- `~/.claude/CLAUDE.md` (global — lowest priority)
- Walk parent directories from project root looking for `CLAUDE.md` and `.claude/CLAUDE.md`
- `<project>/CLAUDE.md` (project root)
- `<project>/.claude/CLAUDE.md` (project .claude/ — highest priority)

**Settings files:**
- `~/.claude/settings.json` (global)
- `~/.claude/settings.local.json` (global local override)
- `<project>/.claude/settings.json` (project)
- `<project>/.claude/settings.local.json` (project local override)

**Skills** (scan all directories):
- `~/.claude/skills/*/SKILL.md` (global skills)
- `<project>/.claude/skills/*/SKILL.md` (project operational skills)
- Skills referenced in settings.json

**Other sources:**
- `<project>/.claude/agents/*.md` (custom agents)
- MCP server configurations (`.mcp.json`)
- Hook scripts referenced in settings

For each source found, read its contents. Note the file size and estimate token count (~4 chars per token).

### Step 2: Report the context inventory

Present a table of all active sources:

```
| Source Type | Scope        | Path                              | Est. Tokens |
|------------|-------------|-----------------------------------|-------------|
| CLAUDE.MD  | Project     | ./CLAUDE.md                       | ~2,400      |
| SKILL      | Project-Ops | .claude/skills/eval-methodology/  | ~1,800      |
| SETTINGS   | Global      | ~/.claude/settings.json           | ~200        |
| ...        | ...         | ...                               | ...         |
```

Include total estimated tokens across all sources. Flag if total exceeds 50,000 tokens.

### Step 3: Analyze CLAUDE.md precedence and conflicts

For each pair of CLAUDE.md files:

1. **List the precedence order** (project .claude/ > project root > parent dirs > global)
2. **Extract strong directives** — lines containing NEVER, ALWAYS, MUST, DO NOT, IMPORTANT, CRITICAL, REQUIRED, FORBIDDEN, OVERRIDE
3. **Compare directives across files** — flag any cases where:
   - One file says NEVER X while another says ALWAYS X
   - One file has instructions that contradict or override another
   - A global instruction is silently overridden by a project instruction (the user may not realize this)
4. **Report findings** with the specific lines and file paths

CORRECT analysis:
```
CONFLICT: Global CLAUDE.md says "NEVER use console.log for debugging"
          but Project CLAUDE.md says "ALWAYS add console.log in error handlers"
          Resolution: Project takes precedence, but this may be unintentional.
```

WRONG analysis:
```
No conflicts found.  (Skipping the actual comparison)
```

### Step 4: Analyze skill trigger overlaps

For each pair of skills:

1. **Extract trigger conditions** — look for "TRIGGER when:", "When to use", "use this when", or the description field
2. **Compare triggers** — flag skills with:
   - Identical or near-identical trigger conditions
   - Overlapping domains (e.g., two skills both trigger on "API development")
   - Ambiguous priority (which fires first if both match?)
3. **Check for naming collisions** — same skill name in global and project scopes
4. **Check activation modes** — distinguish user-invocable (slash commands) from auto-trigger

Present findings as:

```
OVERLAP: "nodejs-security" and "api-hardening" both trigger on API/Express code.
         When building an Express API, both skills would activate.
         Recommendation: Merge, or add exclusion conditions.
```

### Step 5: Check for settings conflicts

Compare settings across scopes (global → global local → project → project local):

1. **Permission conflicts** — allow rules in one scope contradicted by another
2. **Hook conflicts** — same event with different handlers
3. **Model overrides** — project overriding global model settings

### Step 6: Detect worktree-specific issues

If the current project is a git worktree:

1. Note that CLAUDE.md in the worktree may differ from the main working tree
2. Check if worktree has its own `.claude/` modifications
3. Flag any divergence from the main tree's configuration

### Step 7: Present recommendations

Based on all findings, provide actionable recommendations:

- **CRITICAL** — conflicts that will cause incorrect behavior
- **WARNING** — overlaps that may cause confusion
- **INFO** — suggestions for cleaner configuration

## Output format

Use this structure for the report:

```
## Context Audit Report

**Project:** <name> | **Branch:** <branch> | **Worktree:** <yes/no>
**Total sources:** <N> active | **Est. context:** ~<N> tokens

### Source Inventory
<table from Step 2>

### CLAUDE.md Conflicts
<findings from Step 3, or "None detected">

### Skill Trigger Analysis
<findings from Step 4>

### Settings Conflicts
<findings from Step 5>

### Worktree Issues
<findings from Step 6, or "N/A — not in a worktree">

### Recommendations
<prioritized list from Step 7>
```

## Anti-patterns

1. DO NOT skip reading the actual file contents — you need to read each source to analyze it
2. DO NOT assume "no file = no conflict" — missing files can also be a problem (e.g., missing project CLAUDE.md means global applies unchecked)
3. DO NOT report only surface-level findings — dig into the actual directives and compare them
4. DO NOT ignore skills in `drafts/` — they may still be loaded depending on the project setup
5. DO NOT forget hooks — they execute real commands and can conflict with instructions

## Companion shell tool

This skill has a standalone shell dashboard for visual context browsing:

```bash
# Browse all context sources interactively (requires fzf)
~/myskills/drafts/context-visibility-dashboard/scripts/cc-context-dashboard.sh

# Open in new tmux window
~/myskills/drafts/context-visibility-dashboard/scripts/cc-context-dashboard.sh --tmux

# Open in new Ghostty window
~/myskills/drafts/context-visibility-dashboard/scripts/cc-context-dashboard.sh --ghostty

# Run bash-based conflict analysis (no Claude needed)
~/myskills/drafts/context-visibility-dashboard/scripts/cc-context-dashboard.sh --analyze
```

See the README for Ghostty keybinding setup.
