/**
 * The scoring formulas, written once and used by both the squad and the
 * certification run. There is no second opinion and no second implementation.
 *
 * These are pure functions over ids so they can be unit tested without any
 * fixture, which is why the tests next door can prove they behave correctly at
 * the edges that matter: an empty result, one giant finding, one finding per
 * record.
 */

export interface Episode {
  id: string;
  /** Every record id belonging to this injected fault. */
  memberIds: string[];
}

export interface ScoredFinding {
  rank: number;
  /** EVERY record the finding accounts for. Not the citation sample. */
  coveredIds: string[];
}

/** How much of the episode the finding caught. */
export function coverage(finding: ScoredFinding, episode: Episode): number {
  if (episode.memberIds.length === 0) return 0;
  const members = new Set(episode.memberIds);
  const hit = finding.coveredIds.filter((id) => members.has(id)).length;
  return hit / episode.memberIds.length;
}

/** How much of the finding actually belongs to the episode. */
export function purity(finding: ScoredFinding, episode: Episode): number {
  if (finding.coveredIds.length === 0) return 0;
  const members = new Set(episode.memberIds);
  const hit = finding.coveredIds.filter((id) => members.has(id)).length;
  return hit / finding.coveredIds.length;
}

export const MIN_COVERAGE = 0.5;
export const MIN_PURITY = 0.3;

/**
 * The best episode for one finding, ignoring what other findings want. Used by
 * the assignment below and exported because it is the readable unit to test.
 */
export function matchEpisode(finding: ScoredFinding, episodes: Episode[]): Episode | null {
  let best: Episode | null = null;
  let bestOverlap = 0;
  for (const ep of episodes) {
    const c = coverage(finding, ep);
    const p = purity(finding, ep);
    if (c < MIN_COVERAGE || p < MIN_PURITY) continue;
    if (c > bestOverlap) {
      bestOverlap = c;
      best = ep;
    }
  }
  return best;
}

/**
 * True one-to-one assignment between findings and episodes.
 *
 * "Each finding takes its favourite episode" is not enough: two findings can
 * both claim the same episode, which either double counts it or silently drops
 * the second finding depending on the order they happen to be in. Both are
 * wrong, and order-dependent scoring is the worst kind of wrong because it is
 * invisible.
 *
 * Greedy on descending overlap is exact for the sizes here (at most five
 * findings) and is easy to read, which matters more than optimality in a
 * scorer people have to trust.
 */
export function assignOneToOne(
  findings: ScoredFinding[],
  episodes: Episode[],
): Map<ScoredFinding, Episode> {
  const candidates: { f: ScoredFinding; e: Episode; overlap: number }[] = [];
  for (const f of findings) {
    for (const e of episodes) {
      const c = coverage(f, e);
      const p = purity(f, e);
      if (c < MIN_COVERAGE || p < MIN_PURITY) continue;
      candidates.push({ f, e, overlap: c });
    }
  }
  candidates.sort((a, b) => b.overlap - a.overlap);

  const assigned = new Map<ScoredFinding, Episode>();
  const takenEpisodes = new Set<string>();
  for (const { f, e } of candidates) {
    if (assigned.has(f) || takenEpisodes.has(e.id)) continue;
    assigned.set(f, e);
    takenEpisodes.add(e.id);
  }
  return assigned;
}

export interface TopKScore {
  recall: number;
  precision: number;
  matched: string[];
}

export function scoreTopK(findings: ScoredFinding[], episodes: Episode[], k = 5): TopKScore {
  const top = [...findings].sort((a, b) => a.rank - b.rank).slice(0, k);
  const assigned = assignOneToOne(top, episodes);
  const matchedEpisodes = new Set([...assigned.values()].map((e) => e.id));
  const findingsThatMatch = assigned.size;

  return {
    recall: episodes.length === 0 ? 0 : matchedEpisodes.size / episodes.length,
    // Denominator is what was actually returned, capped at k. Returning two
    // findings when there are two real ones must not be punished.
    precision: top.length === 0 ? 0 : findingsThatMatch / Math.min(k, top.length),
    matched: [...matchedEpisodes],
  };
}

/**
 * Pairwise grouping F1.
 *
 * Replaces the "majority template" measure, which was gameable in one line:
 * one cluster per record made every singleton trivially correct and scored
 * 100%. Pairwise punishes splitting and merging equally.
 *
 *   one cluster per record  -> no same-cluster pairs -> recall 0    -> F1 0
 *   one cluster for all     -> precision collapses                 -> F1 ~0
 */
export function groupingF1(
  assigned: Map<string, string>, // recordId -> clusterId
  truth: Map<string, string>,    // recordId -> true template id
): { precision: number; recall: number; f1: number } {
  const ids = [...assigned.keys()].filter((id) => truth.has(id));

  let samePredicted = 0;
  let sameTrue = 0;
  let both = 0;

  for (let i = 0; i < ids.length; i += 1) {
    for (let j = i + 1; j < ids.length; j += 1) {
      const a = ids[i]!;
      const b = ids[j]!;
      const p = assigned.get(a) === assigned.get(b);
      const t = truth.get(a) === truth.get(b);
      if (p) samePredicted += 1;
      if (t) sameTrue += 1;
      if (p && t) both += 1;
    }
  }

  const precision = samePredicted === 0 ? 0 : both / samePredicted;
  const recall = sameTrue === 0 ? 0 : both / sameTrue;
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  return { precision, recall, f1 };
}

/** Binary classification, used by the release digest brief. */
export function binaryScore(
  predictedPositive: Set<string>,
  actualPositive: Set<string>,
  allIds: string[],
): { recall: number; precision: number; falsePositiveRate: number } {
  const tp = [...predictedPositive].filter((id) => actualPositive.has(id)).length;
  const fp = predictedPositive.size - tp;
  const negatives = allIds.filter((id) => !actualPositive.has(id)).length;

  return {
    recall: actualPositive.size === 0 ? 0 : tp / actualPositive.size,
    precision: predictedPositive.size === 0 ? 0 : tp / predictedPositive.size,
    falsePositiveRate: negatives === 0 ? 0 : fp / negatives,
  };
}
