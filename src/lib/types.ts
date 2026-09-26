/**
 * The shapes every project shares. Your brief fills in the details, but the
 * pipeline is the same in all three, which is what lets one scoring harness
 * and one reviewer cope with three projects.
 */

/** Stage 1: a raw record straight off disk, before anything is trusted. */
export interface RawRecord {
  id: string;
  text: string;
  /** Line number, row number, or release identifier. Used for citations. */
  source: string;
}

/** Stage 2: parsed and typed. Anything that would not parse is counted, not dropped. */
export interface NormalisedRecord extends RawRecord {
  at: Date | null;
  fields: Record<string, string | number | null>;
}

export interface NormaliseResult {
  records: NormalisedRecord[];
  /** Never hide this. The interface has to show it. */
  unparseable: number;
}

/**
 * Stage 3: what the product actually returns. A finding is "one thing that
 * happened" and is allowed to span several clusters, because one real fault
 * usually produces several kinds of record.
 *
 * Scoring reads coveredIds. The screen shows evidenceIds. Do not confuse them:
 * a correct finding that cited three examples out of a hundred would score zero
 * if the scorer read the citations.
 */
export interface Finding {
  rank: number;
  title: string;
  score: number;
  /** EVERY record this finding accounts for. The scorer uses this. */
  coveredIds: string[];
  /** A small representative sample. The screen uses this. */
  evidenceIds: string[];
}

export interface DetectResult {
  findings: Finding[];
  /** The cutoff you chose, and why. Returning five when there are two is wrong. */
  threshold: number;
}
