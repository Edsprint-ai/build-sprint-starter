/**
 * Recorded response cache.
 *
 * Every model call is keyed on a hash of its exact request. The first call goes
 * out and the response is written to .cache/ai/. Every identical call after
 * that is served from disk and costs nothing.
 *
 * This is not an optimisation, it is what makes three things possible:
 *   1. Your API credit lasts, because iterating on the screen or the ranking
 *      stops touching the API at all.
 *   2. Tests are deterministic and CI runs stage 4 with no key at all.
 *   3. Your demo cannot fail because of a rate limit.
 *
 * To force a real call: AI_MODE=live, or delete the specific file.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DIR = path.resolve('.cache/ai');

export function cacheKey(input: unknown): string {
  // Stable stringify: key order must not change the hash, or the cache misses
  // on every run for no reason.
  const stable = JSON.stringify(input, (_k, v) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)))
      : v,
  );
  return createHash('sha256').update(stable).digest('hex').slice(0, 32);
}

export async function readCache(key: string): Promise<unknown | null> {
  try {
    return JSON.parse(await readFile(path.join(DIR, `${key}.json`), 'utf8'));
  } catch {
    return null;
  }
}

export async function writeCache(key: string, value: unknown): Promise<void> {
  await mkdir(DIR, { recursive: true });
  await writeFile(path.join(DIR, `${key}.json`), JSON.stringify(value, null, 2));
}
