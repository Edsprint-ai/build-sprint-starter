# Preflight task

**Due: Sunday 4 October, 11:59 PM IST.** The programme starts Monday 5 October.

This is a small first task. It checks that you can reach the project and work
in it, so week 1 can be about building instead of setup.

Before you start, read **[DATA-RULES.md](DATA-RULES.md)**. It is short.

There are two versions. **Do the one for your role.**

---

## Product manager

You do not need to install anything. You only need a web browser and your
GitHub account.

1. Accept the GitHub invite to your squad repository.
2. Open `briefs/problem-brief.md` on GitHub and click the pencil icon to edit it.
3. Fill in the three sections:
   - **The user**: who has this problem
   - **The one question**: what they need answered
   - **One thing out of scope**: something the tool will not do, and why
4. Choose **Create a new branch** and then **Propose changes**. This opens a
   pull request.
5. When an engineer in your squad opens their preflight pull request, leave
   **one comment on a specific line**: what you would change and why.

## Engineer

1. Accept the GitHub invite to your squad repository.
2. Follow **[SETUP.md](SETUP.md)** to set up your computer.
3. Run `pnpm doctor`. It checks your setup and tells you how to fix anything
   that is wrong.
4. Make a new branch:

   ```
   git checkout -b preflight/your-name
   ```

5. Add a file called `preflight/your-name.md` with:
   - your name
   - your operating system (Windows, macOS or Linux)
   - whether `pnpm doctor` passed
   - one sentence about anything that was unclear

   Do **not** paste the full `pnpm doctor` output. It can include folder paths
   from your computer, and this repository is public.

6. Commit, push, and open a pull request.
7. Wait for the **green check mark** on your pull request. That means a clean
   copy of the project builds and its tests pass.
8. Review the other engineer's preflight pull request and leave a comment.

## Stuck?

If you are stuck for more than 20 minutes, reply to the welcome email. Tell us
which step you are on and the error you see. Do not spend hours debugging setup
alone.

## Your name on your work

Your certificate depends on your work being clearly yours. That depends on
`git config user.name` and `git config user.email` being set correctly.
`pnpm doctor` checks this for you.
