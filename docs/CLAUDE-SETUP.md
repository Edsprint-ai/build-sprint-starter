# Getting Claude set up

There are **two separate things** here and almost everyone confuses them at
least once. Read this bit even if you skip the rest.

| | What it is | What it costs | What it is for |
|---|---|---|---|
| **Claude subscription** | An account you log into at claude.ai, and Claude Code in your editor | about **$20 a month** | **Your own work.** Writing code, reading unfamiliar code, thinking through a design |
| **API key** | A secret string starting `sk-ant-` from the Anthropic Console | **$10 to $20 of credit** for the whole eight weeks | **Your project's** model calls. Stage 4 |

A subscription **does not** give your application a programmatic key. If you
paste your login into `.env`, nothing will work and the error will not be
obvious. `pnpm doctor` checks for exactly this mistake.

---

## Part 1: the subscription, for your own work

1. Go to **claude.ai** and sign up.
2. Upgrade to **Pro**, about $20 a month. The free tier will run out partway
   through an afternoon of real work.
3. Install Claude Code. Pick whichever matches how you like to work:
   - **In VS Code:** open Extensions, search **Claude Code**, install, then sign in
     when prompted.
   - **In the terminal:** follow <https://code.claude.com/docs/en/overview>.
   Both use the same subscription. You do not need a key for this.

That is it. You now have Claude for your own work. Week 1 covers using it well,
and `docs/WORKING-WITH-CLAUDE.md` in this repo has the project-specific part.

---

## Part 2: the API key, for your project

Do this in week 4 or 5, when you start stage 4. There is no reason to spend
money before then, and **stage 3 must work without a key anyway**.

1. Go to **console.anthropic.com** and sign in. This is a *different* place
   from claude.ai even though the login may be the same.
2. **Add credit first.** Find Billing, add **$10**. Without credit the key
   exists but every call fails with a confusing error.
   - If you are in India, a UPI or international-enabled card works. If your
     card is declined, email <info@askgurpreet.com> before you spend an hour
     on it.
3. Go to **API keys**, create one, name it something like `build-sprint`.
4. **Copy it now.** It is shown once. If you lose it, delete it and make
   another; there is no way to read it again.
5. Put it in your `.env`:

   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

6. Check it:

   ```
   pnpm doctor
   ```

   It will tell you if the key looks wrong.

### Rules about the key

- **`.env` is gitignored. Never commit it.** `pnpm doctor` fails loudly if
  `.env` has been added to git, because a key in a public repo is found by
  bots in minutes.
- **The key stays server side.** If it reaches the browser you have shipped a
  security bug, and that is a finding in your review.
- **If you ever paste it anywhere public, delete it in the Console immediately**
  and create a new one. No drama, just do it straight away.

### Keeping the cost down

The repo ships a **response cache**. Every model call is saved to
`.cache/ai/`, and an identical call afterwards is served from disk for free.
This is on by default, so normal development costs nothing after the first run.

```
AI_MODE=cache   # default. recorded responses, no cost
AI_MODE=live    # real calls. use when you actually want fresh output
```

A full run inside the budget costs a few cents. Without the cache, a heavy
afternoon of iteration could spend several dollars, which is where a $10
credit would have gone. Build the cache early.

Your budget ceilings live in `src/config.ts` and are enforced in code, so a
runaway loop cannot quietly empty your account.
