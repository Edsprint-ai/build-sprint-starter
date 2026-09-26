/**
 * Scoring for the release-digest brief.
 *
 * The label answers "does this note contain explicit evidence of a breaking
 * change", which is a question about the text. It does NOT answer "is this
 * upgrade breaking", which no release note can settle.
 */
import { binaryScore } from './metrics.js';

export interface LabelledRelease {
  id: string;
  package: string;
  version: string;
  notes: string;
  label: 'explicit_breaking_evidence' | 'no_breaking_evidence_found';
  needsHuman?: boolean;
}

/** What your pipeline returns for each release it flags. */
export interface Flag {
  id: string;
  /** Must appear verbatim in that release's notes. No quote, no flag. */
  quote: string;
}

export interface DigestScore {
  recall: number;
  precision: number;
  falsePositiveRate: number;
  citationRate: number;
  scored: number;
  positives: number;
  uncitedFlags: string[];
}

export function scoreReleaseDigest(releases: LabelledRelease[], flags: Flag[]): DigestScore {
  // Only score what a human has settled. Scoring against unconfirmed labels
  // would be measuring a guess.
  const scored = releases.filter((r) => !r.needsHuman);
  const byId = new Map(scored.map((r) => [r.id, r]));

  // A flag whose quote is not verbatim in the notes does not count as a flag.
  // This is enforced here rather than trusted, because "cite your evidence" is
  // the one rule in this brief with no exceptions.
  const uncited: string[] = [];
  const valid = new Set<string>();
  for (const f of flags) {
    const r = byId.get(f.id);
    if (!r) continue;
    if (f.quote && r.notes.includes(f.quote.trim())) valid.add(f.id);
    else uncited.push(f.id);
  }

  const actual = new Set(
    scored.filter((r) => r.label === 'explicit_breaking_evidence').map((r) => r.id),
  );
  const b = binaryScore(valid, actual, scored.map((r) => r.id));
  const attempted = flags.filter((f) => byId.has(f.id)).length;

  return {
    ...b,
    citationRate: attempted === 0 ? 1 : valid.size / attempted,
    scored: scored.length,
    positives: actual.size,
    uncitedFlags: uncited,
  };
}
