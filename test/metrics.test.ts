/**
 * These tests exist to prove the metrics cannot be gamed. The first two drafts
 * of the specification had metrics that could be, so each test below names the
 * exploit it closes.
 */
import { describe, expect, it } from 'vitest';
import {
  binaryScore, coverage, groupingF1, matchEpisode, purity, scoreTopK,
  type Episode, type ScoredFinding,
} from '../src/scoring/metrics.js';

const ep = (id: string, n: number, offset = 0): Episode => ({
  id,
  memberIds: Array.from({ length: n }, (_, i) => `L${offset + i + 1}`),
});

describe('coverage and purity', () => {
  it('a finding that caught half the episode has coverage 0.5', () => {
    const e = ep('e1', 10);
    const f: ScoredFinding = { rank: 1, coveredIds: ['L1', 'L2', 'L3', 'L4', 'L5'] };
    expect(coverage(f, e)).toBe(0.5);
    expect(purity(f, e)).toBe(1);
  });

  it('scores on covered records, never on the citation sample', () => {
    // The exploit this closes: a correct finding that cites three examples out
    // of a hundred would have scored zero under the old rule.
    const e = ep('e1', 100);
    const f: ScoredFinding = { rank: 1, coveredIds: e.memberIds };
    expect(coverage(f, e)).toBe(1);
  });
});

describe('matchEpisode', () => {
  it('rejects one enormous finding that swallows the whole file', () => {
    // The exploit: cover everything, match every episode, score perfectly.
    // Purity is what stops it.
    const episodes = [ep('e1', 10), ep('e2', 10, 1000)];
    const everything: ScoredFinding = {
      rank: 1,
      coveredIds: Array.from({ length: 5000 }, (_, i) => `L${i + 1}`),
    };
    expect(matchEpisode(everything, episodes)).toBeNull();
  });

  it('matches at most one episode, the highest overlap', () => {
    const episodes = [ep('e1', 10), ep('e2', 10, 100)];
    const f: ScoredFinding = { rank: 1, coveredIds: [...ep('e1', 10).memberIds] };
    expect(matchEpisode(f, episodes)?.id).toBe('e1');
  });
});

describe('scoreTopK', () => {
  it('does not punish returning fewer findings than k when there are fewer faults', () => {
    // The exploit this closes in reverse: "exactly five" forced squads to pad
    // with false positives when the file only contained two real faults.
    const episodes = [ep('e1', 10), ep('e2', 10, 100)];
    const findings: ScoredFinding[] = [
      { rank: 1, coveredIds: ep('e1', 10).memberIds },
      { rank: 2, coveredIds: ep('e2', 10, 100).memberIds },
    ];
    const s = scoreTopK(findings, episodes);
    expect(s.recall).toBe(1);
    expect(s.precision).toBe(1);
  });

  it('is zero on an empty result rather than undefined', () => {
    const s = scoreTopK([], [ep('e1', 10)]);
    expect(s.recall).toBe(0);
    expect(s.precision).toBe(0);
  });
});

describe('groupingF1', () => {
  const truth = new Map([
    ['a', 't1'], ['b', 't1'], ['c', 't1'],
    ['d', 't2'], ['e', 't2'],
  ]);

  it('gives zero to one cluster per record', () => {
    // The exploit this closes: the old majority-template measure scored this
    // 100%, because each singleton's majority template was itself.
    const assigned = new Map([['a', 'c1'], ['b', 'c2'], ['c', 'c3'], ['d', 'c4'], ['e', 'c5']]);
    expect(groupingF1(assigned, truth).f1).toBe(0);
  });

  it('punishes lumping everything into one cluster', () => {
    const assigned = new Map([['a', 'c1'], ['b', 'c1'], ['c', 'c1'], ['d', 'c1'], ['e', 'c1']]);
    const { f1, recall, precision } = groupingF1(assigned, truth);
    expect(recall).toBe(1);
    expect(precision).toBeLessThan(0.6);
    expect(f1).toBeLessThan(0.8);
  });

  it('gives a perfect score to perfect grouping', () => {
    const assigned = new Map([['a', 'x'], ['b', 'x'], ['c', 'x'], ['d', 'y'], ['e', 'y']]);
    expect(groupingF1(assigned, truth).f1).toBe(1);
  });
});

describe('binaryScore', () => {
  it('reports precision, not just recall and false positive rate', () => {
    // Why precision was added: 5 real among 40, a 30% false positive rate is
    // ten wrong warnings sitting next to the useful ones, and recall alone
    // hides that completely.
    const all = Array.from({ length: 40 }, (_, i) => `r${i}`);
    const actual = new Set(all.slice(0, 5));
    const predicted = new Set([...all.slice(0, 4), ...all.slice(5, 15)]);
    const s = binaryScore(predicted, actual, all);
    expect(s.recall).toBeCloseTo(0.8);
    expect(s.precision).toBeCloseTo(4 / 14);
    expect(s.falsePositiveRate).toBeCloseTo(10 / 35);
  });
});
