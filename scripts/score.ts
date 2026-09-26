/**
 * `pnpm score` — the same script that produces your certification number.
 *
 * Run it as often as you like against the visible fixture. In week 8 the same
 * code runs against the hidden fixture, which you have never seen. There is no
 * second implementation and no second opinion.
 *
 * It runs with NO API KEY on purpose. Your score comes from stage 3.
 */
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { groupingF1, scoreTopK, type Episode, type ScoredFinding } from '../src/scoring/metrics.js';

interface Fixture {
  version: string;
  episodes: Episode[];
  /** recordId -> true template id, for grouping quality. */
  templates?: Record<string, string>;
}

const FIXTURE = process.env.FIXTURE ?? 'fixtures/visible.json';

async function main() {
  if (!existsSync(FIXTURE)) {
    console.error(`\n  No fixture at ${FIXTURE}.`);
    console.error('  Fixtures are issued with your brief. Run `pnpm fixtures` to fetch yours.\n');
    process.exit(1);
  }

  const raw = await readFile(FIXTURE, 'utf8');
  const fixture: Fixture = JSON.parse(raw);
  const checksum = createHash('sha256').update(raw).digest('hex').slice(0, 16);

  // TODO(squad): import your pipeline here and produce findings from the
  // fixture. Until then this reports zero, which is correct: you have not
  // written stage 3 yet.
  const findings: ScoredFinding[] = [];
  const assigned = new Map<string, string>();

  const top = scoreTopK(findings, fixture.episodes, 5);

  console.log(`\n  fixture   ${fixture.version}`);
  console.log(`  checksum  ${checksum}`);
  console.log(`  episodes  ${fixture.episodes.length}`);
  console.log('');
  console.log(`  recall@5     ${top.recall.toFixed(3)}`);
  console.log(`  precision@5  ${top.precision.toFixed(3)}`);

  if (fixture.templates) {
    const truth = new Map(Object.entries(fixture.templates));
    const g = groupingF1(assigned, truth);
    console.log(`  grouping F1  ${g.f1.toFixed(3)}   (p ${g.precision.toFixed(3)} r ${g.recall.toFixed(3)})`);
  }

  console.log('');
  if (findings.length === 0) {
    console.log('  Zero because stage 3 returns nothing yet. That is src/stages/3-detect/.\n');
  }
}

main();
