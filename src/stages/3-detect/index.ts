/**
 * Stage 3: find what stands out, with ordinary code and statistics.
 *
 * NO MODEL CALLS IN THIS FILE. That is not style, it is the rule the scorer
 * and the reviewer both check: `pnpm score` runs with no API key and this
 * stage has to produce the ranked list by itself.
 *
 * The trap: skipping this and asking a model instead. Then the key expires
 * during the week 8 demo and there is nothing underneath.
 */
import type { DetectResult, NormalisedRecord } from '../../lib/types.js';

export function detect(records: NormalisedRecord[]): DetectResult {
  // TODO(squad): this is the stage your score comes from. Group, count,
  // compare against a baseline, rank. Return AT MOST five findings, and only
  // those above a threshold you can defend. Returning five when there are two
  // real ones costs you precision.
  const threshold = 0;
  void records;
  return { findings: [], threshold };
}
