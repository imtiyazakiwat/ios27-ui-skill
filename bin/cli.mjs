#!/usr/bin/env node
// ios27-ui — installs the iOS 27 UI agent skill into a project (or your home dir).
// Zero dependencies. Node >= 18.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PKG = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const SKILL_NAME = 'ios27-ui';
const SKILL_SRC = join(ROOT, 'skills', SKILL_NAME);
const RULES_BODY = join(ROOT, 'adapters', 'rules.md');
const GLOBS = '**/*.tsx,**/*.jsx,**/*.css,**/*.vue,**/*.svelte,**/*.swift';
const DESCRIPTION =
  'iOS 27 (Liquid Glass) UI rules for creating, auditing, redesigning or converting app screens — tab bar, navigation bar, lists, sheets, menus, motion.';

// Skill targets get the full folder (SKILL.md + references + assets).
// Rule targets get a short summary file that points at an installed skill folder.
const TARGETS = {
  claude: { kind: 'skill', label: 'Claude Code', project: '.claude/skills', global: '.claude/skills', detect: '.claude' },
  kiro: { kind: 'skill', label: 'Kiro', project: '.kiro/skills', global: '.kiro/skills', detect: '.kiro' },
  agents: { kind: 'skill', label: 'Codex / .agents standard', project: '.agents/skills', global: '.agents/skills', detect: '.agents' },
  cursor: {
    kind: 'rule', label: 'Cursor', file: '.cursor/rules/ios27-ui.mdc', detect: '.cursor',
    header: `---\ndescription: ${DESCRIPTION}\nglobs: ${GLOBS}\nalwaysApply: false\n---\n`,
  },
  windsurf: {
    kind: 'rule', label: 'Windsurf', file: '.windsurf/rules/ios27-ui.md', detect: '.windsurf',
    header: `---\ntrigger: model_decision\ndescription: ${DESCRIPTION}\n---\n`,
  },
  copilot: {
    kind: 'rule', label: 'GitHub Copilot', file: '.github/instructions/ios27-ui.instructions.md', detect: '.github',
    header: `---\napplyTo: "${GLOBS}"\n---\n`,
  },
};

const HELP = `ios27-ui v${PKG.version} — iOS 27 / Liquid Glass UI skill for AI coding agents

Usage
  npx ios27-ui [add] [targets...] [options]   Install (default command)
  npx ios27-ui remove [targets...] [options]  Uninstall
  npx ios27-ui list                           Show targets and install status

Targets
${Object.entries(TARGETS).map(([k, t]) => `  ${k.padEnd(10)}${t.label}${t.kind === 'rule' ? ' (summary rule, project only)' : ''}`).join('\n')}

  With no targets, installs for Claude Code plus any tool folders already in the project.

Options
  --all          Install every target
  -g, --global   Install skills into your home directory instead of the project
  --dir <path>   Project directory (default: current directory)
  -f, --force    Overwrite an existing install without asking
  --dry-run      Print what would change, write nothing
  -h, --help     Show help
  -v, --version  Show version
`;

function parseArgs(argv) {
  const opts = { cmd: 'add', targets: [], all: false, global: false, force: false, dryRun: false, dir: process.cwd() };
  const args = [...argv];
  if (['add', 'remove', 'list', 'update'].includes(args[0])) opts.cmd = args.shift();
  if (opts.cmd === 'update') { opts.cmd = 'add'; opts.force = true; }
  while (args.length) {
    const a = args.shift();
    if (a === '--all') opts.all = true;
    else if (a === '-g' || a === '--global') opts.global = true;
    else if (a === '-f' || a === '--force') opts.force = true;
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--dir') opts.dir = resolve(args.shift() ?? fail('--dir needs a path'));
    else if (a === '-h' || a === '--help') opts.cmd = 'help';
    else if (a === '-v' || a === '--version') opts.cmd = 'version';
    else if (a.startsWith('-')) fail(`Unknown option: ${a}`);
    else if (TARGETS[a]) opts.targets.push(a);
    else fail(`Unknown target: ${a}. Run with --help to see targets.`);
  }
  return opts;
}

function fail(msg) {
  console.error(`ios27-ui: ${msg}`);
  process.exit(1);
}

function baseDir(opts) {
  return opts.global ? homedir() : opts.dir;
}

function skillPath(opts, key) {
  const t = TARGETS[key];
  return join(baseDir(opts), opts.global ? t.global : t.project, SKILL_NAME);
}

function resolveTargets(opts) {
  let keys = opts.all ? Object.keys(TARGETS) : [...opts.targets];
  if (!keys.length) {
    keys = ['claude', ...Object.keys(TARGETS).filter(k => k !== 'claude' && existsSync(join(baseDir(opts), TARGETS[k].detect)))];
    // .github almost always exists; only auto-pick Copilot if it already has instructions.
    if (keys.includes('copilot') && !existsSync(join(baseDir(opts), '.github/instructions'))) keys = keys.filter(k => k !== 'copilot');
  }
  if (opts.global) {
    const skipped = keys.filter(k => TARGETS[k].kind === 'rule');
    if (skipped.length) console.log(`Skipping ${skipped.join(', ')}: rule files are project-only.`);
    keys = keys.filter(k => TARGETS[k].kind === 'skill');
  }
  // Rule files reference a full skill folder; make sure one gets installed.
  if (keys.some(k => TARGETS[k].kind === 'rule') && !keys.some(k => TARGETS[k].kind === 'skill')) keys.unshift('agents');
  return [...new Set(keys)];
}

// Stamp the installed version so `list` can report it and updates are detectable.
function versionFile(dir) {
  return join(dir, '.ios27-ui-version');
}

function installedVersion(dir) {
  try { return readFileSync(versionFile(dir), 'utf8').trim(); } catch { return null; }
}

function add(opts) {
  const keys = resolveTargets(opts);
  const base = baseDir(opts);
  const rel = p => relative(base, p) || '.';
  let wrote = 0;
  let skipped = 0;
  const skillDirs = [];

  for (const key of keys.filter(k => TARGETS[k].kind === 'skill')) {
    const dest = skillPath(opts, key);
    skillDirs.push(dest);
    const current = installedVersion(dest);
    if (existsSync(dest) && !opts.force && current === PKG.version) {
      console.log(`  = ${TARGETS[key].label.padEnd(26)} ${rel(dest)} (already v${current})`);
      skipped++;
      continue;
    }
    if (existsSync(dest) && !opts.force && current === null) {
      console.log(`  ! ${TARGETS[key].label.padEnd(26)} ${rel(dest)} exists and was not installed by ios27-ui. Use --force to overwrite.`);
      skipped++;
      continue;
    }
    if (!opts.dryRun) {
      rmSync(dest, { recursive: true, force: true });
      mkdirSync(dirname(dest), { recursive: true });
      cpSync(SKILL_SRC, dest, { recursive: true });
      writeFileSync(versionFile(dest), `${PKG.version}\n`);
    }
    console.log(`  + ${TARGETS[key].label.padEnd(26)} ${rel(dest)}${current ? ` (v${current} -> v${PKG.version})` : ''}`);
    wrote++;
  }

  const ruleKeys = keys.filter(k => TARGETS[k].kind === 'rule');
  if (ruleKeys.length) {
    const pointer = rel(skillDirs[0]).split('\\').join('/');
    const body = readFileSync(RULES_BODY, 'utf8').replaceAll('{{SKILL_DIR}}', pointer);
    for (const key of ruleKeys) {
      const t = TARGETS[key];
      const dest = join(base, t.file);
      const content = `${t.header}${body}`;
      if (existsSync(dest) && !opts.force) {
        const old = readFileSync(dest, 'utf8');
        if (old === content) { console.log(`  = ${t.label.padEnd(26)} ${t.file} (up to date)`); skipped++; continue; }
        if (!old.includes('iOS 27 UI rules')) {
          console.log(`  ! ${t.label.padEnd(26)} ${t.file} exists with other content. Use --force to overwrite.`);
          skipped++;
          continue;
        }
      }
      if (!opts.dryRun) {
        mkdirSync(dirname(dest), { recursive: true });
        writeFileSync(dest, content);
      }
      console.log(`  + ${t.label.padEnd(26)} ${t.file}`);
      wrote++;
    }
  }

  const prefix = opts.dryRun ? '[dry run] would install' : 'Installed';
  console.log(`\n${prefix} ${wrote} target(s)${skipped ? `, skipped ${skipped}` : ''}.`);
  if (wrote && !opts.dryRun) console.log('Try asking your agent: "Audit this screen against iOS 27 and redesign it."');
}

function remove(opts) {
  const keys = opts.all || !opts.targets.length ? Object.keys(TARGETS) : opts.targets;
  const base = baseDir(opts);
  let removed = 0;
  for (const key of keys) {
    const t = TARGETS[key];
    if (opts.global && t.kind === 'rule') continue;
    const dest = t.kind === 'skill' ? skillPath(opts, key) : join(base, t.file);
    if (!existsSync(dest)) continue;
    // Only remove what we installed.
    const ours = t.kind === 'skill' ? installedVersion(dest) !== null : readFileSync(dest, 'utf8').includes('iOS 27 UI rules');
    if (!ours && !opts.force) {
      console.log(`  ! ${t.label.padEnd(26)} ${relative(base, dest)} was not installed by ios27-ui. Use --force to remove.`);
      continue;
    }
    if (!opts.dryRun) rmSync(dest, { recursive: true, force: true });
    console.log(`  - ${t.label.padEnd(26)} ${relative(base, dest)}`);
    removed++;
  }
  console.log(`\n${opts.dryRun ? '[dry run] would remove' : 'Removed'} ${removed} target(s).`);
}

function list(opts) {
  const base = baseDir(opts);
  console.log(`ios27-ui v${PKG.version} — ${opts.global ? 'global' : base}\n`);
  for (const [key, t] of Object.entries(TARGETS)) {
    if (opts.global && t.kind === 'rule') continue;
    const dest = t.kind === 'skill' ? skillPath(opts, key) : join(base, t.file);
    let status = 'not installed';
    if (existsSync(dest)) {
      const v = t.kind === 'skill' ? installedVersion(dest) : 'rule';
      status = v === null ? 'present (not managed)' : v === 'rule' ? 'installed' : `v${v}${v !== PKG.version ? ' (update available)' : ''}`;
    }
    console.log(`  ${key.padEnd(10)}${t.label.padEnd(26)}${status}`);
  }
}

const opts = parseArgs(process.argv.slice(2));
if (opts.cmd === 'help') console.log(HELP);
else if (opts.cmd === 'version') console.log(PKG.version);
else if (opts.cmd === 'list') list(opts);
else if (opts.cmd === 'remove') remove(opts);
else add(opts);
