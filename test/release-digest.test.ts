/**
 * Each test names the thing it stops a squad getting away with.
 */
import { describe, expect, it } from 'vitest';
import { scoreReleaseDigest, type Flag, type LabelledRelease } from '../src/scoring/release-digest.js';

const rel = (id: string, label: LabelledRelease['label'], notes: string, needsHuman = false): LabelledRelease =>
  ({ id, package: 'p', version: '1.0.0', notes, label, needsHuman });

const SET: LabelledRelease[] = [
  rel('a', 'explicit_breaking_evidence', 'Header\n## Breaking Changes\nfoo removed'),
  rel('b', 'explicit_breaking_evidence', 'BREAKING CHANGE: drops node 16'),
  rel('c', 'no_breaking_evidence_found', 'Fixed a typo in the readme'),
  rel('d', 'no_breaking_evidence_found', 'Perf: faster parsing'),
  rel('e', 'no_breaking_evidence_found', 'Mentions breaking in passing, not a change'),
  rel('z', 'explicit_breaking_evidence', 'unconfirmed label', true),
];

describe('scoreReleaseDigest', () => {
  it('drops a flag whose quote is not verbatim in the notes', () => {
    // Stops the obvious cheat: flag everything, invent a plausible-sounding
    // quote. An unevidenced flag is an opinion, so it does not count.
    const flags: Flag[] = [
      { id: 'a', quote: '## Breaking Changes' },
      { id: 'b', quote: 'this sentence is not in the notes' },
    ];
    const s = scoreReleaseDigest(SET, flags);
    expect(s.recall).toBe(0.5);
    expect(s.citationRate).toBe(0.5);
    expect(s.uncitedFlags).toEqual(['b']);
  });

  it('never scores a release a human has not confirmed', () => {
    // Tier B and C labels are proposals. Scoring against them would measure a
    // guess and blame the squad for it.
    const s = scoreReleaseDigest(SET, [{ id: 'z', quote: 'unconfirmed label' }]);
    expect(s.scored).toBe(5);
    expect(s.positives).toBe(2);
    expect(s.recall).toBe(0);
  });

  it('punishes flagging everything, which is the real failure mode', () => {
    const flags = SET.filter((r) => !r.needsHuman).map((r) => ({ id: r.id, quote: r.notes.slice(0, 10) }));
    const s = scoreReleaseDigest(SET, flags);
    expect(s.recall).toBe(1);
    expect(s.precision).toBeCloseTo(2 / 5);
    expect(s.falsePositiveRate).toBe(1);
  });

  it('gives a perfect score to perfect work', () => {
    const s = scoreReleaseDigest(SET, [
      { id: 'a', quote: '## Breaking Changes' },
      { id: 'b', quote: 'BREAKING CHANGE: drops node 16' },
    ]);
    expect(s.recall).toBe(1);
    expect(s.precision).toBe(1);
    expect(s.falsePositiveRate).toBe(0);
    expect(s.citationRate).toBe(1);
  });
});
