/**
 * Stage 2: ragged text into consistent typed records.
 *
 * The trap: silently skipping what will not parse. Count it and show the count
 * in the interface. A parser that quietly drops 40% of the file looks like it
 * works right up until the demo.
 */
import type { NormaliseResult, NormalisedRecord, RawRecord } from '../../lib/types.js';

export async function normalise(source: AsyncIterable<RawRecord>): Promise<NormaliseResult> {
  const records: NormalisedRecord[] = [];
  let unparseable = 0;

  for await (const raw of source) {
    const parsed = parseOne(raw);
    if (parsed === null) {
      unparseable += 1;
      continue;
    }
    records.push(parsed);
  }
  return { records, unparseable };
}

function parseOne(raw: RawRecord): NormalisedRecord | null {
  // TODO(squad): your brief decides what a record looks like. Extract the
  // timestamp and the variable parts, and return null when the line genuinely
  // cannot be understood.
  return { ...raw, at: null, fields: {} };
}
