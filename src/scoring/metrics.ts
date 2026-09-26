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
 * A finding matches at most one episode: the highest-overlap one that clears
 * both bars. Purity is what stops one enormous finding containing most of the
 * file from matching every episode at once.
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

export interface TopKScore {
  recall: number;
  precision: number;
  matched: string[];
}

export function scoreTopK(findings: ScoredFinding[], episodes: Episode[], k = 5): TopKScore {
  const top = [...findings].sort((a, b) => a.rank - b.rank).slice(0, k);
  const matchedEpisodes = new Set<string>();
  let findingsThatMatch = 0;

  for (const f of top) {
    const ep = matchEpisode(f, episodes);
    if (ep) {
      findingsThatMatch += 1;
      matchedEpisodes.add(ep.id);
    }
  }

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
