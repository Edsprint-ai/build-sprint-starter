# Model costs

Fill this in during week 1 from the published price list on the day, then keep
it current. A dollar figure with no model and no token ceiling behind it is
decoration.

## Pinned model

```
claude-haiku-4-5-20251001
```

Pinned on purpose. Changing the model changes your scores, so it changes only
by erratum.

## Run budget

One ceiling for the **whole run**, not per item. Enforced in
`src/ai/budget.ts`, which throws rather than letting a run overspend.

| Limit | Value | Where |
|---|---|---|
| Model calls | 5 | `src/config.ts` |
| Total input tokens | 40,000 | `src/config.ts` |
| Total output tokens | 5,000 | `src/config.ts` |
| Retries across the run | 2 | `src/config.ts` |
| Wall clock | 30s | `src/config.ts` |

Your brief may set different numbers. These are the defaults.

## Actual cost

| Date | Price per Mtok in | Price per Mtok out | Cost of one full run | Notes |
|---|---|---|---|---|
| _week 1_ | | | | _from the published list that day_ |

Failed calls count. They cost money too.

## Cached runs

`AI_MODE=cache` is the default and serves recorded responses for free. Only
`AI_MODE=live` spends anything. If your credit is disappearing, check you are
not running live by accident.
