# Preflight task

**Due Thursday 1 October.** Under an hour. It is not a test you can fail into
rejection: if you cannot finish it, you get a **full refund before the
programme starts**, which is much better for you than discovering in week 3
that the setup was never going to work on your machine.

You get one round of help. Ask early.

Read **[DATA-RULES.md](DATA-RULES.md)** first. It is four minutes and it is
the one document with consequences outside this programme.

## What to do

1. Follow `docs/SETUP.md` and get `pnpm doctor` green.
2. Clone this repo, create a branch: `git checkout -b preflight/your-name`
3. Add one file: `preflight/your-name.md`, containing
   - your name and the track you applied for
   - your operating system
   - the output of `pnpm doctor`
   - one sentence on anything that was confusing
4. Commit and push. Open a pull request.
5. Check that the **CI check goes green** on your PR.

That last step is the real content of this task. If CI is green, your machine
can build and run the project, and week 1 can be about the project instead of
about installation.

## What it proves

| Step | What it tells us |
|---|---|
| doctor green | Node, pnpm, Docker, Postgres and your `.env` are right |
| branch and commit | Git works and your commits are attributable to you |
| pull request | You can use the workflow the whole programme runs on |
| CI green | A clean clone of your work actually builds and runs |

Attribution matters beyond this task: your certificate depends on your
contributions being identifiably yours, which depends on `git config user.name`
and `user.email` being right. The doctor checks it.
