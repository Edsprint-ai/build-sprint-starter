/**
 * One budget for the whole run, not per item.
 *
 * Per-item budgets look small and multiply into something that is not. Ten
 * items at 8k tokens each with one retry is 160k tokens, which is nothing like
 * the number printed next to "per item".
 *
 * Exceeding a ceiling throws. A run that costs more than it was allowed to is
 * a failed run, not a slow one.
 */
export interface BudgetLimits {
  maxCalls: number;
  maxInputTokens: number;
  maxOutputTokens: number;
  maxRetries: number;
  maxWallClockMs: number;
}

export class BudgetExceeded extends Error {}

export class Budget {
  private calls = 0;
  private inputTokens = 0;
  private outputTokens = 0;
  private retries = 0;
  private readonly startedAt = Date.now();

  constructor(private readonly limits: BudgetLimits) {}

  /** Call before dispatching. Throws rather than letting the run overspend. */
  claimCall(): void {
    if (this.calls >= this.limits.maxCalls) {
      throw new BudgetExceeded(`run budget: ${this.limits.maxCalls} model calls already used`);
    }
    if (Date.now() - this.startedAt > this.limits.maxWallClockMs) {
      throw new BudgetExceeded(`run budget: over ${this.limits.maxWallClockMs}ms wall clock`);
    }
    this.calls += 1;
  }

  claimRetry(): void {
    if (this.retries >= this.limits.maxRetries) {
      throw new BudgetExceeded(`run budget: ${this.limits.maxRetries} retries already used`);
    }
    this.retries += 1;
  }

  /** Failed calls count. They cost money too. */
  record(inputTokens: number, outputTokens: number): void {
    this.inputTokens += inputTokens;
    this.outputTokens += outputTokens;
    if (this.inputTokens > this.limits.maxInputTokens) {
      throw new BudgetExceeded(`run budget: over ${this.limits.maxInputTokens} input tokens`);
    }
    if (this.outputTokens > this.limits.maxOutputTokens) {
      throw new BudgetExceeded(`run budget: over ${this.limits.maxOutputTokens} output tokens`);
    }
  }

  report() {
    return {
      calls: this.calls,
      retries: this.retries,
      inputTokens: this.inputTokens,
      outputTokens: this.outputTokens,
      elapsedMs: Date.now() - this.startedAt,
      limits: this.limits,
    };
  }
}
