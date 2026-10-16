// Validates the skill before every commit/publish: frontmatter, links, size budget, and a CLI smoke run.
// Usage: node scripts/validate.mjs
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKILL = join(ROOT, 'skill', 'ios27-ui');
const errors = [];
const err = msg => errors.push(msg);

// 1. SKILL.md frontmatter (Agent Skills spec: name <= 64 chars kebab-case matching folder, description <= 1024 chars).
const skillMd = readFileSync(join(SKILL, 'SKILL.md'), 'utf8');
const fm = skillMd.match(/^---\n([\s\S]*?)\n---\n/);
if (!fm) err('SKILL.md: missing YAML frontmatter');
else {
  const field = k => fm[1].match(new RegExp(`^${k}:\\s*(.+)$`, 'm'))?.[1].trim();
  const name = field('name');
  const description = field('description');
  if (name !== 'ios27-ui') err(`SKILL.md: name must be "ios27-ui" (folder name), got "${name}"`);
  if (!/^[a-z0-9-]{1,64}$/.test(name ?? '')) err('SKILL.md: name must be kebab-case, <= 64 chars');
  if (!description) err('SKILL.md: description is required');
  else if (description.length > 1024) err(`SKILL.md: description is ${description.length} chars (max 1024)`);
}

// 2. SKILL.md body budget — keep the entry point lean; detail belongs in references/.
const lines = skillMd.split('\n').length;
if (lines > 500) err(`SKILL.md: ${lines} lines (keep under 500; move detail into references/)`);

// 3. Every `references/...` or `assets/...` path mentioned in any markdown file must exist.
const files = (function walk(dir) {
  return readdirSync(dir).flatMap(n => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
})(SKILL);
for (const file of files.filter(f => f.endsWith('.md'))) {
  const text = readFileSync(file, 'utf8');
  for (const [, p] of text.matchAll(/`((?:references|assets)\/[\w./-]+?)`/g)) {
    const target = join(SKILL, p.replace(/\/$/, ''));
    if (!existsSync(target)) err(`${file.slice(ROOT.length + 1)}: broken path \`${p}\``);
  }
}

// 4. Every reference file is listed in SKILL.md so agents can discover it.
for (const ref of readdirSync(join(SKILL, 'references'))) {
  if (!skillMd.includes(`references/${ref}`)) err(`SKILL.md: references/${ref} is not listed`);
}

// 5. Adapter template keeps its placeholder.
if (!readFileSync(join(ROOT, 'adapters', 'rules.md'), 'utf8').includes('{{SKILL_DIR}}')) err('adapters/rules.md: missing {{SKILL_DIR}}');

// 6. No junk files shipped.
for (const f of files) if (/\.DS_Store$|Thumbs\.db$/.test(f)) err(`junk file: ${f.slice(ROOT.length + 1)}`);

// 7. CLI smoke test in a temp project: add -> list -> idempotent add -> remove.
const tmp = mkdtempSync(join(tmpdir(), 'ios27-ui-'));
const cli = (...args) => execFileSync(process.execPath, [join(ROOT, 'bin', 'cli.mjs'), ...args, '--dir', tmp], { encoding: 'utf8' });
try {
  cli('add', '--all');
  for (const p of ['.claude/skills/ios27-ui/SKILL.md', '.kiro/skills/ios27-ui/SKILL.md', '.agents/skills/ios27-ui/SKILL.md',
    '.cursor/rules/ios27-ui.mdc', '.windsurf/rules/ios27-ui.md', '.github/instructions/ios27-ui.instructions.md']) {
    if (!existsSync(join(tmp, p))) err(`cli add --all: missing ${p}`);
  }
  const rule = readFileSync(join(tmp, '.cursor/rules/ios27-ui.mdc'), 'utf8');
  if (rule.includes('{{SKILL_DIR}}') || !rule.includes('.claude/skills/ios27-ui/SKILL.md')) err('cli: cursor rule path not substituted');
  if (!cli('add', '--all').includes('Installed 0 target(s)')) err('cli: second add should be a no-op');
  if (!cli('list').includes('v')) err('cli list: no version shown');
  cli('remove');
  if (existsSync(join(tmp, '.claude/skills/ios27-ui'))) err('cli remove: skill folder still present');
} catch (e) {
  err(`cli smoke test crashed: ${e.message}`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):\n${errors.map(e => `  - ${e}`).join('\n')}`);
  process.exit(1);
}
console.log(`✓ skill valid (${files.length} files, SKILL.md ${lines} lines), CLI smoke test passed`);
