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
  /**
   * The frozen pass marks, shipped WITH the fixture.
   *
   * Students see the number they have to hit. Hiding the formula would be
   * defensible; hiding the required result is not, because then "done" is
   * something only the instructor can check.
   */
  thresholds: { recallAt5: number; precisionAt5: number; groupingF1?: number };
}

/** What `pnpm analyse` writes. See docs/EVALUATION-CONTRACT.md. */
interface AnalyseOutput {
  findings: ScoredFinding[];
  clusters?: Record<string, string>;
}

const FIXTURE = process.env.FIXTURE ?? 'fixtures/log-analyser/visible.json';
const OUTPUT = process.env.OUTPUT ?? 'out/findings.json';

async function main() {
  if (!existsSync(FIXTURE)) {
    console.error(`\n  No fixture at ${FIXTURE}.\n`);
    process.exit(1);
  }
  if (!existsSync(OUTPUT)) {
    console.error(`\n  No output at ${OUTPUT}. Run this first:\n`);
    console.error('  pnpm analyse --input fixtures/log-analyser/visible.log --out out/findings.json\n');
    process.exit(1);
  }

  const raw = await readFile(FIXTURE, 'utf8');
  const fixture: Fixture = JSON.parse(raw);
  const checksum = createHash('sha256').update(raw).digest('hex').slice(0, 16);

  // The same file the hidden run scores. Nothing here re-runs your pipeline,
  // so what you score is exactly what you would submit.
  const output: AnalyseOutput = JSON.parse(await readFile(OUTPUT, 'utf8'));
  const findings = output.findings ?? [];
  const assigned = new Map(Object.entries(output.clusters ?? {}));

  const top = scoreTopK(findings, fixture.episodes, 5);

  const rows: { name: string; got: number; need: number | undefined }[] = [
    { name: 'recall@5', got: top.recall, need: fixture.thresholds.recallAt5 },
    { name: 'precision@5', got: top.precision, need: fixture.thresholds.precisionAt5 },
  ];

  if (fixture.templates) {
    const truth = new Map(Object.entries(fixture.templates));
    rows.push({ name: 'grouping F1', got: groupingF1(assigned, truth).f1, need: fixture.thresholds.groupingF1 });
  }

  console.log(`\n  fixture   ${fixture.version}`);
  console.log(`  sha256    ${checksum}`);
  console.log(`  episodes  ${fixture.episodes.length}`);
  console.log('');
  console.log('  measure         your score   needed   ');
  console.log('  ' + '-'.repeat(44));

  let allPass = true;
  for (const r of rows) {
    const need = r.need;
    const pass = need === undefined ? true : r.got >= need;
    if (!pass) allPass = false;
    const verdict = need === undefined ? '' : pass ? 'PASS' : 'NOT YET';
    console.log(
      `  ${r.name.padEnd(16)}${r.got.toFixed(3).padStart(10)}` +
        `${(need === undefined ? '-' : need.toFixed(3)).padStart(9)}   ${verdict}`,
    );
  }

  console.log('');
  console.log(`  ${allPass ? 'PASS' : 'NOT YET'} against the frozen thresholds for this fixture.`);
  console.log('');
  if (findings.length === 0) {
    console.log('  Zero because your output has no findings yet. Stage 3 is src/stages/3-detect/.\n');
  }
  // Exit non-zero when short, so this can gate anything later without a rewrite.
  if (!allPass) process.exitCode = 1;
}

main();
