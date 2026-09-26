#!/usr/bin/env node
/**
 * `pnpm starter:version` — is this squad repo still in step with the starter?
 *
 * Squad repos are point-in-time copies of the template. Every change to the
 * starter after kickoff has to be propagated by a pull request into each one,
 * and without a marker the only way to notice drift is to diff by hand, which
 * nobody does.
 *
 * STARTER_VERSION records the starter commit this repo was last synced to. It
 * is written during the sync, not committed in the starter, because a file
 * cannot contain the hash of the commit that contains it.
 */
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const local = readFileSync('STARTER_VERSION', 'utf8').trim();

if (local === 'this-is-the-starter') {
  console.log('  This IS the starter repo, so there is nothing to compare.\n');
  process.exit(0);
}
console.log(`  this repo was synced to starter commit  ${local}`);

try {
  const latest = execSync(
    'gh api repos/Edsprint-ai/build-sprint-starter/commits/main --jq .sha',
    { stdio: ['ignore', 'pipe', 'ignore'] },
  ).toString().trim();
  if (latest.startsWith(local) || local.startsWith(latest.slice(0, local.length))) {
    console.log('  up to date with the starter\n');
  } else {
    console.log(`  starter is now at                       ${latest.slice(0, local.length)}`);
    console.log('\n  This repo has drifted. Ask for the sync PR rather than');
    console.log('  copying files across by hand.\n');
    process.exitCode = 1;
  }
} catch {
  console.log('  (could not reach GitHub to compare, which is fine offline)\n');
}
