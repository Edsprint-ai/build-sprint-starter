# Handling the data, and what never goes into a prompt

Read this before you touch a fixture. It takes four minutes and it is the
easiest way on this programme to do real harm to someone who is not in the room.

## Your fixture is other people's lives

Project 02 in particular hands you thousands of **real complaints written by
real members of the public**. Not sample data. Someone sat down, often at a bad
moment, and wrote about being unable to pay a bill, a debt collector calling
their workplace, or a mortgage going wrong. Many narratives contain names,
account details, employers, health circumstances and financial distress.

The logs in project 01 and the release notes in project 03 are lower stakes but
the same rule applies: it is not yours, and you are a guest in it.

So:

- **Do not copy fixture records into Slack, a chat window, a gist, a blog post,
  a screenshot in your portfolio, or anywhere else outside the squad repo.**
- **Do not put a person's narrative into a public demo.** If you need a screen
  recording for your portfolio, use redacted or synthetic examples.
- **Do not try to identify anyone.** Cross-referencing a complaint against
  anything else is out of scope and out of bounds.
- If you find something in a fixture that looks like it should not be public,
  tell us. Do not investigate it yourself.

## This repository is public

Your squad repo is public from day one. That is deliberate: it is the portfolio
you leave with, and public work history is worth more to you than a private
repo nobody can see. It also means everything below is not advice, it is a rule.

**Never commit:**

- **Your employer's code, or anything under an NDA.** If you have a job, none
  of it comes in here. Not a snippet, not a config, not "just as an example".
  This is the one that ends careers, and it is entirely avoidable.
- **Real personal data.** Fixture records stay in the fixture. See above.
- **Credentials of any kind.** `pnpm check:secrets` runs on every pull request
  and fails the build if it finds one, but do not rely on it catching
  everything.
- **Anything you would not want a future employer to read.** They will. That is
  the point of a public portfolio, and it cuts both ways.

Push protection is on for this repository, so GitHub will block a push that
contains a recognised secret. Treat that as a last line, not a first one.

## What never goes into a prompt

This is universal practice, not a programme rule, and it will follow you into
every job you have afterwards.

**Never put into a model prompt:**

- Credentials of any kind: API keys, passwords, tokens, connection strings
- Personal data belonging to real people, where you have a choice
- Anything under an NDA, and anything belonging to your current employer
- Security logs or incident detail from a real system
- Private keys, certificates, `.env` contents

**Instead:** sanitise. Replace names with `PERSON_1`, account numbers with
`ACCT_1`, keys with `sk-ant-REDACTED`. If the structure is what matters, and it
usually is, a placeholder works exactly as well as the real value.

There is a real asymmetry here. Pasting a key into a prompt takes one second
and rotating it after takes ten minutes; **not** rotating it because you hoped
it was fine can cost a lot more than that.

## The project's own model calls

Stage 4 sends fixture text to a model. That is expected, it is what the project
is, and it is inside the boundary we set.

What is **not** inside the boundary is you pasting a hundred complaints into a
chat window to "see what it makes of them". Use the pipeline. That path is
budgeted, logged, cached, and has the untrusted-input handling in it.

## Treat every fixture record as hostile

Separately from privacy: logs, complaints and release notes are **text written
by strangers**, and some of it will contain things that look like instructions
to a model. That is why `src/ai/client.ts` wraps untrusted text in delimiters
and why the frontend escapes everything on render.

You will demonstrate one injection attempt being neutralised in week 8. Being
able to say "here is what someone tried, and here is why it did nothing" is a
genuinely good interview answer.

## If you get it wrong

Tell us straight away. Nobody is in trouble for a mistake reported quickly.

- **Committed a key?** Rotate it in the Anthropic Console first, then remove it
  from the repo. In that order. Assume anything pushed to GitHub was scraped
  within minutes, even from a private repo.
- **Posted fixture data somewhere public?** Delete it, then tell us so we can
  check whether anything further is needed.

`pnpm doctor` fails loudly if `.env` is ever tracked by git, which is the most
common version of this.
