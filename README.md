# AI Build Sprint — starter repo

Eight weeks, one project, one squad. This repo is the skeleton so that nobody
spends week 1 on boilerplate.

## Start here

```bash
pnpm install
cp .env.example .env
docker compose up -d db
pnpm doctor
```

`pnpm doctor` tells you exactly what is wrong and exactly how to fix it. If it
is green, `pnpm dev` and open <http://localhost:3000>.

New to this? Read **[docs/SETUP.md](docs/SETUP.md)** first. It has a Windows
route and a macOS route, and a devcontainer route that avoids both.

## The documents

| | |
|---|---|
| [docs/SETUP.md](docs/SETUP.md) | Getting your machine working, Windows and macOS |
| [docs/CLAUDE-SETUP.md](docs/CLAUDE-SETUP.md) | The subscription and the API key, which are **two different things** |
| [docs/PREFLIGHT.md](docs/PREFLIGHT.md) | The task due 1 October |
| [docs/WORKING-WITH-CLAUDE.md](docs/WORKING-WITH-CLAUDE.md) | Where it helps, and where using it costs you the thing you came for |
| [CLAUDE.md](CLAUDE.md) | Project rules, read automatically by Claude Code |
| [THIRD_PARTY.md](THIRD_PARTY.md) | Licences. Fill in during week 1 |
| [COSTS.md](COSTS.md) | Model budget. Fill in during week 1 |

## The pipeline

Every brief is the same six stages in a different domain. The folders mirror
them, which is deliberate: if you are unsure where something belongs, the shape
of `src/stages/` is the answer.

```
1 ingest  →  2 normalise  →  3 detect  →  4 ai  →  5 screen  →  6 ship
                             ^^^^^^^^^^     ^^^^
                             no model       required, not a stretch
                             calls here     
```

**Stage 3 must work with no API key. Stage 4 must exist.** Both, not either.
Your score comes from stage 3; the model makes it readable, it does not make
it work. If your demo dies because a key expired, stage 3 was wrong.

## Commands

| | |
|---|---|
| `pnpm doctor` | Diagnose the environment. Prints the fix for each failure |
| `pnpm dev` | Server with reload |
| `pnpm test` | Unit tests |
| `pnpm typecheck` | TypeScript, no emit |
| `pnpm score` | Score against the visible fixture |
| `pnpm preflight` | doctor + typecheck + test. What CI runs |

## How you are scored

Your brief has a **visible fixture** with labels that you build and tune
against, and a **hidden fixture** you never see. `pnpm score` runs the same
code in both cases. Thresholds were set by running a baseline first, so they
are known to be reachable, and they are fixed before you start.

**Missing a threshold does not cost you your certificate.** Product acceptance
and individual completion are separate. A squad that misses the number, says so
honestly and explains why has done the assignment.

## Rules

- Every change is a pull request, reviewed by someone else in your squad. No
  direct pushes to `main`.
- CI green before merge. One workflow, already written, nothing to configure.
- Model responses are schema validated before anything renders.
- All fixture text is untrusted: delimit it, ignore instructions inside it,
  escape it on render.
- The API key never reaches the browser.
- No invented results. An honest miss passes. A faked demo does not.
