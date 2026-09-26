#!/usr/bin/env node
/**
 * `pnpm doctor` — tells you exactly what is wrong and exactly how to fix it.
 *
 * This exists so that at 11pm on a Tuesday you are not blocked waiting for
 * someone to answer a message. Every failure below prints the command that
 * fixes it. If a check here is ever wrong or unclear, that is a bug worth
 * raising: the whole point is that it is trustworthy.
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import net from 'node:net';

const results = [];
const ok = (name, detail) => results.push({ state: 'ok', name, detail });
const bad = (name, detail, fix) => results.push({ state: 'bad', name, detail, fix });
const warn = (name, detail, fix) => results.push({ state: 'warn', name, detail, fix });

const sh = (cmd) => {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return null;
  }
};

// ---- node
const major = Number(process.versions.node.split('.')[0]);
if (major >= 22) ok('Node', `v${process.versions.node}`);
else
  bad('Node', `v${process.versions.node}, need 22 or newer`,
    'macOS:  brew install node\nWindows: winget install OpenJS.NodeJS.LTS\nOr use fnm: https://github.com/Schniz/fnm');

// ---- pnpm
const pnpm = sh('pnpm -v');
if (pnpm) ok('pnpm', `v${pnpm}`);
else bad('pnpm', 'not found', 'corepack enable && corepack prepare pnpm@latest --activate');

// ---- git identity, because unattributed commits break the certificate
const gitName = sh('git config user.name');
const gitEmail = sh('git config user.email');
if (gitName && gitEmail) ok('Git identity', `${gitName} <${gitEmail}>`);
else
  bad('Git identity', 'name or email not set',
    'git config --global user.name "Your Name"\ngit config --global user.email "you@example.com"\n' +
    'This matters: your certificate depends on your commits being attributable to you.');

// ---- docker
const docker = sh('docker --version');
if (!docker) {
  bad('Docker', 'not found',
    'macOS:  brew install --cask docker   then open Docker Desktop\n' +
    'Windows: winget install Docker.DockerDesktop   then enable the WSL2 backend');
} else if (sh('docker info') === null) {
  bad('Docker', 'installed but not running', 'Start Docker Desktop and wait for the whale to stop animating.');
} else {
  ok('Docker', docker.replace('Docker version ', 'v'));
}

// ---- postgres reachable
const dbUp = await new Promise((resolve) => {
  const socket = net.createConnection({ host: 'localhost', port: 5432 });
  const done = (v) => { socket.destroy(); resolve(v); };
  socket.setTimeout(1500);
  socket.on('connect', () => done(true));
  socket.on('error', () => done(false));
  socket.on('timeout', () => done(false));
});
if (dbUp) ok('Postgres', 'reachable on localhost:5432');
else bad('Postgres', 'nothing listening on 5432', 'docker compose up -d\nThen wait about ten seconds and run pnpm doctor again.');

// ---- dependencies
if (existsSync('node_modules')) ok('Dependencies', 'node_modules present');
else bad('Dependencies', 'node_modules missing', 'pnpm install');

// ---- .env
if (!existsSync('.env')) {
  bad('.env', 'missing', 'cp .env.example .env   (Windows PowerShell: copy .env.example .env)');
} else {
  const env = readFileSync('.env', 'utf8');
  const key = /^ANTHROPIC_API_KEY=(.*)$/m.exec(env)?.[1]?.trim() ?? '';
  ok('.env', 'present');
  if (key === '') {
    warn('API key', 'not set, which is fine for now',
      'Stage 3 must work without it, so this is a valid state.\n' +
      'You need it for stage 4 in week 5: see docs/CLAUDE-SETUP.md');
  } else if (!key.startsWith('sk-ant-')) {
    bad('API key', 'does not look like an Anthropic key',
      'Keys start with sk-ant-. You may have pasted a subscription login rather than an API key.\n' +
      'See docs/CLAUDE-SETUP.md, these are two different things.');
  } else {
    ok('API key', `set, ${key.slice(0, 11)}…`);
  }
}

// ---- the one that bites: a key committed to git
const tracked = sh('git ls-files .env');
if (tracked) bad('.env is tracked by git', 'your key is about to be public',
  'git rm --cached .env\nThen rotate the key in the Anthropic Console immediately.');

// ---- report
const width = Math.max(...results.map((r) => r.name.length)) + 2;
const mark = { ok: '  ok  ', bad: ' FAIL ', warn: ' note ' };
console.log('');
for (const r of results) {
  console.log(`${mark[r.state]} ${r.name.padEnd(width)} ${r.detail}`);
}
const failures = results.filter((r) => r.state === 'bad');
if (failures.length) {
  console.log('\n  Fix these:\n');
  for (const f of failures) {
    console.log(`  ${f.name}`);
    for (const line of f.fix.split('\n')) console.log(`    ${line}`);
    console.log('');
  }
  process.exit(1);
}
for (const w of results.filter((r) => r.state === 'warn')) {
  console.log(`\n  ${w.name}: ${w.fix.split('\n').join('\n  ')}`);
}
console.log('\n  Everything needed is in place. `pnpm dev` to start.\n');
