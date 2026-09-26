/**
 * Stage 1: read the fixture. Do not crash on the messy parts.
 *
 * The trap: reading the whole file into a string. It works on the sample and
 * dies on the real fixture. Stream it.
 */
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import type { RawRecord } from '../../lib/types.js';

export async function* readLines(filePath: string): AsyncGenerator<RawRecord> {
  const stream = createReadStream(filePath, { encoding: 'utf8' });
  const lines = createInterface({ input: stream, crlfDelay: Infinity });
  let n = 0;
  for await (const line of lines) {
    n += 1;
    if (line.trim() === '') continue;
    yield { id: `L${n}`, text: line, source: String(n) };
  }
}
