# The evaluation contract

This is the interface your project must implement. It is the only thing the
evaluator knows about your code, and it is deliberately narrow.

## The command

```
pnpm analyse --input <path> --out <path>
```

- `--input` a file you may read. For the hidden run it is a fixture you have
  never seen, in the same format as your visible one.
- `--out` a file you must write, containing findings in the shape below.
- Exit 0 on success, non-zero on failure.

Nothing else is available. No network, no labels, no environment beyond what
you are given.

## The output shape

```json
{
  "findings": [
    {
      "rank": 1,
      "title": "Connection pool exhausted",
      "score": 0.94,
      "coveredIds": ["L120", "L121", "L122"],
      "evidenceIds": ["L120", "L122"]
    }
  ],
  "unparseable": 12,
  "clusters": { "L1": "c3", "L2": "c3" },
  "budget": { "calls": 3, "inputTokens": 18234, "outputTokens": 1100 }
}
```

| Field | Meaning |
|---|---|
| `coveredIds` | **Every** record this finding accounts for. The scorer reads this |
| `evidenceIds` | A small sample for the screen. The scorer ignores it |
| `clusters` | record id to cluster id, for grouping quality. Optional but scored if present |
| `unparseable` | count of records you could not parse. Never hide it |
| `budget` | your model usage for the run |

Return **at most five** findings, and only those above a threshold you can
defend. Returning five when there are three real faults costs you precision.

## How the hidden run actually works

This matters, because it explains why the contract is so narrow.

1. Your repository is checked out and built **into its own container**.
2. The **unlabeled** hidden input is mounted read only. Nothing else is.
3. The evaluator runs `pnpm analyse` and takes your output file.
4. **Scoring happens outside the container**, against labels your code never
   sees, in a separate private repository.

So there is nothing to find by reading the filesystem, because the answers are
not in it. This is not distrust: an evaluation where the labels are reachable
from the code being evaluated is not an evaluation, and designing it properly
is the same reason your own tests use fixtures rather than asserting on
production data.

## Running it yourself

Identical, against your visible fixture:

```
pnpm analyse --input fixtures/log-analyser/visible.log --out out/findings.json
pnpm score
```

`pnpm score` reads your output and your visible labels and prints your score
against the frozen thresholds. The hidden run uses the same code.
