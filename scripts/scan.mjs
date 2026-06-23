#!/usr/bin/env node
// scan.mjs — Scan a Claude Code plugin collection repo and generate ./data.js
// for the catalog SPA. Zero dependencies (node:fs / node:path only).
//
// Usage:
//   node scripts/scan.mjs <repo-path-or-".">  [--source <github-owner/repo | git-url | local-path>]
//                                             [--out <path/to/data.js>]
//                                             [--no-installed]
//                                             [--overwrite]
//                                             [--help]
//
// Strategy: if <repo>/.claude-plugin/marketplace.json exists, parse it.
// Otherwise infer the catalog from folder structure (plugin.json / SKILL.md /
// skills|commands|agents dirs).
//
// Output shape (multi-marketplace, file://-safe, no fetch):
//   window.PLUGIN_CATALOG = {
//     marketplaces: [
//       { marketplace: { name, addSource, description }, plugins: [...], generatedAt, mode },
//       ...
//     ]
//   };
//
// MERGE BEHAVIOR (default): the scanned marketplace is added to the existing
//   data.js — or, if a marketplace with the same `name` already exists, that
//   entry is REPLACED in place. This lets you build up several marketplaces.
//   Use --overwrite to discard any existing data.js and write a single entry.
//   On a fresh run (no data.js yet) the output is identical either way.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import vm from "node:vm";
import { execSync } from "node:child_process";

// ---------- arg parsing ----------
const argv = process.argv.slice(2);
let repoArg = ".";
let sourceFlag = null;
let outFlag = null;
let readInstalled = true;
let overwrite = false;

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--source") sourceFlag = argv[++i];
  else if (a === "--out") outFlag = argv[++i];
  else if (a === "--no-installed") readInstalled = false;
  else if (a === "--overwrite") overwrite = true;
  else if (a === "--help" || a === "-h") {
    console.log(
      "Usage: node scripts/scan.mjs <repo-path-or-.> [--source <owner/repo|git-url|path>]\n" +
      "                                 [--out <path/to/data.js>] [--no-installed] [--overwrite]\n\n" +
      "Scans a Claude Code plugin repo and merges it into ./data.js as one marketplace entry.\n" +
      "By default an existing marketplace with the same name is replaced in place; others are kept.\n" +
      "Use --overwrite to replace the whole data.js with just this marketplace."
    );
    process.exit(0);
  } else if (!a.startsWith("--")) repoArg = a;
}

const repoRoot = path.resolve(repoArg);
const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const projectRoot = path.resolve(scriptDir, "..");
const outPath = outFlag ? path.resolve(outFlag) : path.join(projectRoot, "data.js");

if (!fs.existsSync(repoRoot) || !fs.statSync(repoRoot).isDirectory()) {
  console.error(`✖ Not a directory: ${repoRoot}`);
  process.exit(1);
}

// ---------- helpers ----------
const SKIP_DIRS = new Set([
  "node_modules", ".git", ".github", "dist", "build", "coverage",
  ".next", ".cache", "vendor", "__pycache__",
]);

function kebab(s) {
  return String(s)
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/^-+|-+$/g, "");
}

function readJSON(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

// Parse the YAML-ish frontmatter of a SKILL.md (we only need a few scalar keys).
function readFrontmatter(p) {
  try {
    const txt = fs.readFileSync(p, "utf8");
    const m = txt.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!m) return {};
    const out = {};
    for (const line of m[1].split("\n")) {
      const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (kv) out[kv[1]] = kv[2].replace(/^["']|["']$/g, "").trim();
    }
    return out;
  } catch {
    return {};
  }
}

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "with", "your",
  "you", "use", "used", "uses", "using", "when", "this", "that", "skill",
  "should", "be", "it", "is", "are", "as", "by", "from", "into", "any", "all",
  "user", "users", "claude", "code", "plugin", "plugins", "their", "them",
]);

function keywordsFromText(text, limit = 8) {
  const counts = new Map();
  for (const raw of String(text || "").toLowerCase().split(/[^a-z0-9-]+/)) {
    const w = raw.replace(/^-+|-+$/g, "");
    if (w.length < 4 || STOPWORDS.has(w)) continue;
    counts.set(w, (counts.get(w) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([w]) => w);
}

function listDirs(dir) {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !SKIP_DIRS.has(e.name) && !e.name.startsWith("."))
      .map((e) => e.name);
  } catch {
    return [];
  }
}

// ---------- normalization ----------
// Produce one uniform plugin shape regardless of source.
function normalize(p) {
  const tags = new Set();
  if (Array.isArray(p.tags)) p.tags.forEach((t) => tags.add(String(t)));
  if (Array.isArray(p.keywords)) p.keywords.forEach((t) => tags.add(String(t)));
  if (typeof p.category === "string" && p.category) tags.add(p.category);

  return {
    name: p.name,
    description: p.description || "",
    version: p.version || "",
    author:
      typeof p.author === "string"
        ? p.author
        : (p.author && p.author.name) || "",
    category: typeof p.category === "string" ? p.category : "",
    tags: [...tags],
    homepage: p.homepage || "",
    source: p.source || "",
    installed: false, // filled later
  };
}

// ---------- catalog discovery ----------
let marketplaceName = null;
let marketplaceDescription = "";
let plugins = [];

const mfPath = path.join(repoRoot, ".claude-plugin", "marketplace.json");
let mode;

if (fs.existsSync(mfPath)) {
  mode = "marketplace.json";
  const mf = readJSON(mfPath) || {};
  marketplaceName = mf.name || kebab(path.basename(repoRoot));
  marketplaceDescription = mf.description || (mf.metadata && mf.metadata.description) || "";
  plugins = (mf.plugins || []).map((p) => normalize(p));
} else {
  mode = "inferred";
  marketplaceName = kebab(path.basename(repoRoot));

  // Pass 1: any plugin.json (root-level or under .claude-plugin/) marks a plugin dir.
  const found = new Map(); // pluginDir -> manifest
  function walk(dir, depth) {
    if (depth > 4) return;
    for (const name of listDirs(dir)) {
      const full = path.join(dir, name);
      const cp = path.join(full, ".claude-plugin", "plugin.json");
      const rp = path.join(full, "plugin.json");
      if (fs.existsSync(cp)) found.set(full, readJSON(cp) || {});
      else if (fs.existsSync(rp)) found.set(full, readJSON(rp) || {});
      walk(full, depth + 1);
    }
  }
  // Also consider the repo root itself as a plugin.
  const rootCp = path.join(repoRoot, ".claude-plugin", "plugin.json");
  const rootRp = path.join(repoRoot, "plugin.json");
  if (fs.existsSync(rootCp)) found.set(repoRoot, readJSON(rootCp) || {});
  else if (fs.existsSync(rootRp)) found.set(repoRoot, readJSON(rootRp) || {});
  walk(repoRoot, 0);

  // Pass 2: if nothing had a manifest, treat dirs that contain skills/commands/agents
  // (or a SKILL.md) as plugins.
  if (found.size === 0) {
    const markerDirs = ["skills", "commands", "agents", "hooks"];
    const candidates = [repoRoot, ...listDirs(repoRoot).map((d) => path.join(repoRoot, d))];
    for (const c of candidates) {
      const hasMarker =
        markerDirs.some((m) => fs.existsSync(path.join(c, m))) ||
        fs.existsSync(path.join(c, "SKILL.md"));
      if (hasMarker) found.set(c, {});
    }
  }

  for (const [dir, manifest] of found) {
    // Gather a description + tags by sniffing the plugin's contents.
    let description = manifest.description || "";
    const skillDir = path.join(dir, "skills");
    const skillNames = listDirs(skillDir);
    let skillDescText = "";
    for (const sn of skillNames) {
      const fm = readFrontmatter(path.join(skillDir, sn, "SKILL.md"));
      if (fm.description) skillDescText += " " + fm.description;
      if (!description && fm.description) description = fm.description;
    }
    // Also a top-level SKILL.md (single-skill plugin).
    const topFm = readFrontmatter(path.join(dir, "SKILL.md"));
    if (topFm.description) {
      skillDescText += " " + topFm.description;
      if (!description) description = topFm.description;
    }

    const tags = new Set([
      ...skillNames.map(kebab),
      ...keywordsFromText(`${description} ${skillDescText}`),
    ]);

    plugins.push(
      normalize(
        {
          name: manifest.name || path.basename(dir),
          description,
          version: manifest.version || "",
          author: manifest.author,
          tags: [...tags],
          homepage: manifest.homepage,
          source: dir === repoRoot ? "./" : "./" + path.relative(repoRoot, dir),
        }
      )
    );
  }
}

// ---------- resolve `marketplace add` source ----------
function resolveAddSource() {
  if (sourceFlag) return sourceFlag;
  // Try git remote → owner/repo
  try {
    const url = execSync("git config --get remote.origin.url", {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    const m = url.match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/);
    if (m) return m[1];
    if (url) return url;
  } catch {
    /* not a git repo */
  }
  return repoRoot; // fall back to absolute local path
}
const addSource = resolveAddSource();

// ---------- mark installed ----------
if (readInstalled) {
  const installedPath = path.join(os.homedir(), ".claude", "plugins", "installed_plugins.json");
  const installed = readJSON(installedPath);
  if (installed && installed.plugins) {
    for (const p of plugins) {
      if (installed.plugins[`${p.name}@${marketplaceName}`]) p.installed = true;
    }
  }
}

// ---------- build this marketplace entry ----------
const entry = {
  marketplace: { name: marketplaceName, addSource, description: marketplaceDescription },
  plugins,
  generatedAt: new Date().toISOString(),
  mode,
};

// ---------- load existing marketplaces (for merge) ----------
// Read the current data.js (if any) by evaluating it against a fake `window`,
// then normalize both the new {marketplaces:[...]} and the legacy
// {marketplace, plugins} shapes into an array we can merge into.
function readExistingMarketplaces(p) {
  try {
    if (!fs.existsSync(p)) return [];
    const src = fs.readFileSync(p, "utf8");
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext(src, sandbox);
    const cat = sandbox.window.PLUGIN_CATALOG;
    if (!cat) return [];
    if (Array.isArray(cat.marketplaces)) return cat.marketplaces;
    if (cat.marketplace || cat.plugins) {
      return [{ marketplace: cat.marketplace, plugins: cat.plugins, generatedAt: cat.generatedAt, mode: cat.mode }];
    }
    return [];
  } catch {
    return [];
  }
}

let marketplaces;
if (overwrite) {
  marketplaces = [entry];
} else {
  marketplaces = readExistingMarketplaces(outPath);
  const existingIdx = marketplaces.findIndex(
    (m) => m && m.marketplace && m.marketplace.name === marketplaceName
  );
  if (existingIdx >= 0) marketplaces[existingIdx] = entry; // replace in place
  else marketplaces.push(entry);
}

// ---------- emit data.js ----------
const out = { marketplaces };
const banner =
  `// Generated by scripts/scan.mjs — do not edit by hand.\n` +
  `// Multi-marketplace catalog. Each entry: { marketplace:{name,addSource,description}, plugins:[...], generatedAt, mode }\n`;
fs.writeFileSync(outPath, `${banner}window.PLUGIN_CATALOG = ${JSON.stringify(out, null, 2)};\n`);

console.log(`✓ Scanned (${mode}): ${repoRoot}`);
console.log(`  marketplace : ${marketplaceName}`);
console.log(`  add source  : ${addSource}`);
console.log(`  plugins     : ${plugins.length}${plugins.some((p) => p.installed) ? ` (${plugins.filter((p) => p.installed).length} already installed)` : ""}`);
console.log(`  marketplaces: ${marketplaces.length} total in catalog`);
console.log(`  wrote       : ${outPath} (${overwrite ? "overwrite" : "merge"})`);
