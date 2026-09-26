#!/usr/bin/env node
/**
 * Fails if anything that looks like a credential, or a .env file, is about to
 * be committed or has been.
 *
 * This repo is PUBLIC. A key pushed here is scraped within minutes, and the
 * fix is always "rotate it", never "delete the commit", because the commit is
 * already in someone's mirror. So the cheapest place to stop it is here.
 *
 * Runs in CI on every pull request, and from `pnpm preflight`.
 */
import { execSync } from 'node:child_process';

const PATTERNS = [
  [/sk-ant-[A-Za-z0-9_-]{20,}/, 'Anthropic API key'],
  [/gh[pousr]_[A-Za-z0-9]{30,}/, 'GitHub token'],
  [/AKIA[0-9A-Z]{16}/, 'AWS access key id'],
  [/-----BEGIN (?:RSA |OPENSSH |EC |PGP )?PRIVATE KEY-----/, 'private key'],
  [/xox[baprs]-[0-9A-Za-z-]{10,}/, 'Slack token'],
  [/postgres(?:ql)?:\/\/[^\s:@/]+:(?!sprint@)[^\s:@/]+@/, 'database URL with a real password'],
];

const sh = (cmd) => execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();

let failed = false;
const fail = (msg) => {
  console.error(`  FAIL  ${msg}`);
  failed = true;
};

// 1. .env files must never be tracked, in any commit, ever.
const tracked = sh('git ls-files').split('\n').filter(Boolean);
for (const f of tracked) {
  if (/(^|\/)\.env(\.|$)/.test(f) && !f.endsWith('.env.example')) {
    fail(`${f} is tracked by git. Run: git rm --cached ${f}`);
  }
}

// 2. Scan every tracked file's current content.
for (const f of tracked) {
  let body = '';
  try {
    body = sh(`git show HEAD:${JSON.stringify(f)}`);
  } catch {
    continue;
  }
  // This file necessarily contains the patterns it looks for.
  if (f === 'scripts/check-secrets.mjs') continue;
  for (const [re, name] of PATTERNS) {
    const m = re.exec(body);
    if (m) fail(`${f} looks like it contains a ${name}: ${m[0].slice(0, 12)}…`);
  }
}

// 3. .env.example must contain placeholders, never a real value.
try {
  const example = sh('git show HEAD:.env.example');
  const key = /^ANTHROPIC_API_KEY=(.*)$/m.exec(example)?.[1]?.trim();
  if (key) fail('.env.example has a value for ANTHROPIC_API_KEY. It must be empty.');
} catch {
  /* no .env.example yet */
}

if (failed) {
  console.error(
    '\n  This repository is public. If a real credential reached a commit,\n' +
      '  ROTATE IT FIRST, then clean the history. In that order.\n',
  );
  process.exit(1);
}
console.log('  ok    no credentials or .env files in tracked content');
