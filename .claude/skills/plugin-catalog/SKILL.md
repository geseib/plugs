---
name: plugin-catalog
description: Use when the user wants to browse, search, or install plugins from a Claude Code plugin collection / marketplace repo. Scans a repo (local path or git URL), regenerates the catalog single-page app's data, and produces (or runs) the install commands to add plugins into the current project.
---

# Plugin Catalog

Turn any repo of Claude Code plugins into a searchable, click-to-install single-page app — and install the selected plugins into the current project. No backend.

## When to use
- "Scan this plugin repo and let me pick what to install"
- "Update the plugin catalog page"
- "Install plugins X and Y from <marketplace>"

## Files in this project
- `scripts/scan.mjs` — scanner/generator (Node, zero deps)
- `index.html` — the self-contained SPA (open via `file://` or serve)
- `data.js` — generated catalog the page reads (`window.PLUGIN_CATALOG`)

Run all commands from the project root that contains `scripts/scan.mjs` (this project).

## Workflow

### 1. Resolve the target repo
- **Local path** → use it directly.
- **Git URL** (e.g. `https://github.com/owner/repo` or `owner/repo`) → shallow-clone to a temp dir first:
  ```bash
  git clone --depth 1 <url> /tmp/plugcat-<name>
  ```
  Use that temp path as the repo. For `owner/repo` shorthand, prefer passing it through as the marketplace `--source` (Claude Code can add `owner/repo` directly) while cloning `https://github.com/owner/repo` to read its contents.

### 2. Scan → regenerate `data.js`
```bash
node scripts/scan.mjs <repo-path> --source <github-owner/repo | git-url | local-path>
```
- The scanner uses `<repo>/.claude-plugin/marketplace.json` if present, otherwise **infers** the catalog from folder structure (`plugin.json`, `SKILL.md`, `skills/`, `commands/`, `agents/`).
- `--source` is what the page's install command passes to `claude plugin marketplace add`. If omitted, the scanner tries the repo's git remote, then falls back to the absolute local path. **Set `--source` to `owner/repo` when you know it** — it produces the cleanest install command.
- The scanner also marks plugins already present in `~/.claude/plugins/installed_plugins.json` with an "Installed" badge.

Report back: marketplace name, plugin count, the add-source, and how many are already installed.

### 3. Tell the user to open the page
```bash
open index.html          # macOS — opens via file://, no server needed
# or, for a shareable/GitHub-Pages-style serve:
python3 -m http.server 8000   # then visit http://localhost:8000
```
In the page they search (name/tag/keyword/author), filter by tag chips, select plugins, and click **Install selected** to copy either the CLI commands or a natural-language prompt.

### 4. Close the loop (optional — install directly)
If the user instead names the plugins (or pastes the page's "Claude prompt"), run the install yourself from their target project directory:
```bash
claude plugin marketplace add <add-source>
claude plugin install <plugin>@<marketplace> --scope project
```
- One `install` line per plugin. `marketplace add` is idempotent (safe to re-run).
- `--scope project` installs into the current project (use `--scope user` for global).
- Verify with `claude plugin list`.

## Notes
- The catalog handles both marketplace conventions: a single `category` string and a `tags[]` array.
- `data.js` is generated — don't hand-edit it; re-run the scanner instead.
- To make this skill available everywhere, copy or symlink `.claude/skills/plugin-catalog` into `~/.claude/skills/`.
