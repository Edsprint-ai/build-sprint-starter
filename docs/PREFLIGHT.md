# Preflight task

**Due Thursday 1 October.** Under an hour. It is not a test you can fail into
rejection: if you cannot finish it, you get a **full refund before the
programme starts**, which is much better for you than discovering in week 3
that the setup was never going to work on your machine.

You get one round of help. Ask early.

Read **[DATA-RULES.md](DATA-RULES.md)** first. It is four minutes and it is
the one document with consequences outside this programme.

**There are two versions. Do the one for your track.** The product track needs
no code, no local environment and no Docker, because none of that is part of
the product role.

---

## If you applied for the product track

Nothing to install. You need a browser and a GitHub account.

1. Accept the repository invite we send you.
2. Open `briefs/problem-brief.md` in GitHub and click the pencil to edit it.
3. Fill in the three blanks: **the user**, **the one question** they need
   answered, and **one thing that is out of scope**. Three sentences is plenty.
4. Commit to a new branch and open a pull request.
5. Find the pull request we opened called **Preflight: review me**, and leave
   one comment on a specific line saying what you would change and why.

That is the whole task. It proves you can work through GitHub, which is where
the whole programme runs, without pretending you need to be an engineer.

## If you applied for the engineering track

1. Follow `docs/SETUP.md` and get `pnpm doctor` green.
2. Clone this repo, create a branch: `git checkout -b preflight/your-name`
3. Add one file: `preflight/your-name.md`, containing
   - your name, your track and your operating system
   - the output of `pnpm doctor`
   - one sentence on anything that was confusing
4. Commit and push. Open a pull request.
5. Check that the **CI check goes green** on your PR.

That last step is the real content. If CI is green, your machine can build and
run the project, and week 1 can be about the project instead of installation.

## What each one proves

| Step | What it tells us |
|---|---|
| Repo invite accepted | You can reach the work |
| Edit and open a PR | You can use the workflow the programme runs on |
| Review comment | You can give feedback on a specific line, which is most of week 3 onward |
| doctor green *(engineering)* | Node, pnpm, Docker, Postgres and your `.env` are right |
| CI green *(engineering)* | A clean clone of your work actually builds and runs |

Attribution matters beyond this task: your certificate depends on your
contributions being identifiably yours, which depends on `git config user.name`
and `user.email` being right. The doctor checks it.
