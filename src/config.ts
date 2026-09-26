export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://sprint:sprint@localhost:5432/sprint',
  model: process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001',
  hasApiKey: Boolean(process.env.ANTHROPIC_API_KEY),
  aiMode: (process.env.AI_MODE ?? 'cache') as 'cache' | 'live',
} as const;

/**
 * One budget for the whole run. Your brief sets the numbers; these are the
 * defaults and they are deliberately tight.
 */
export const runBudget = {
  maxCalls: 5,
  maxInputTokens: 40_000,
  maxOutputTokens: 5_000,
  maxRetries: 2,
  maxWallClockMs: 30_000,
} as const;
