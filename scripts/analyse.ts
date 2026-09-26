/**
 * The entry point the evaluator calls. See docs/EVALUATION-CONTRACT.md.
 *
 * It must run with no network, no labels and no API key present, because that
 * is how the hidden run executes. If this needs anything that is not the input
 * file, the hidden run will fail and the failure will be yours.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { readLines } from '../src/stages/1-ingest/index.js';
import { normalise } from '../src/stages/2-normalise/index.js';
import { detect } from '../src/stages/3-detect/index.js';

const args = process.argv;
const arg = (n: string) => {
  const i = args.indexOf(n);
  return i > -1 ? args[i + 1] : undefined;
};

const input = arg('--input');
const out = arg('--out');
if (!input || !out) {
  console.error('usage: pnpm analyse --input <file> --out <file>');
  process.exit(2);
}

const { records, unparseable } = await normalise(readLines(input));
const { findings } = detect(records);

// clusters is optional, but grouping quality is scored when it is present.
const clusters: Record<string, string> = {};

await mkdir(path.dirname(out), { recursive: true });
await writeFile(
  out,
  JSON.stringify({ findings, unparseable, clusters, budget: null }, null, 2),
);
console.log(`  ${findings.length} findings, ${unparseable} unparseable -> ${out}`);
