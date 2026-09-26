# Working with Claude on this project

Generic prompt-engineering advice is a search away and Claude Academy is free.
This page is the part nobody else will tell you: **where it helps on this
particular project, and where using it costs you the thing you came for.**

## Where it earns its keep

**Understanding code you did not write.** The reference project named in your
brief is real production code. Open it and ask what a file does and why it is
shaped that way. This is the single best use of it in week 1.

**Preparing a pull request review.** Before you review a squad-mate's PR, ask
for the three things most likely to be wrong with it. Then check each one
yourself. You will catch more, and you will learn what to look for, which is
the actual skill.

**The boring correct version.** Test scaffolding, type definitions, a parser
for a format you have described precisely. Things where you already know what
right looks like and typing it is the only cost.

**Rubber-ducking a decision.** Explain your design out loud and ask what breaks
at ten times the load. You have to articulate it, which is most of the value.

## Where it costs you

**Do not let it write your design doc.** That document, and the trade-offs in
it, are what you get asked about in week 8 and in every interview after. A
generated design doc reads fine and collapses on the first follow-up question,
because you did not make the decisions in it.

**Do not let it write the PRD, the metrics, or the scope cuts.** Same reason.
If you are the PM, these are the entire artefact you are here to produce.

**Do not let it invent your stage 3.** The detection logic is what your score
comes from and what the review is about. Use it to check your maths, not to
supply the idea.

**Do not paste a wall of generated code into a PR you cannot explain.** You
will be asked, in the weekly review, why a particular line is there. "Claude
wrote it" is a real answer and it is also the end of that conversation.

The test: **if you could not defend it under follow-up questions, do not ship
it.** Week 8 is five minutes each on what you decided and why.

## CLAUDE.md

There is a `CLAUDE.md` at the repo root. Claude Code reads it automatically and
it encodes the rules that are specific to this project, the ones a general
model has no way to know: no model calls in stage 3, every response validated,
all fixture text untrusted.

Keep it short. A `CLAUDE.md` that drifts out of date is worse than none,
because it confidently states things that are no longer true. Update it in the
same PR as the change it describes.

## A practical setting

Claude Code has effort levels. The default is high and it will chew through
your subscription limits quickly. For most work on this project, a lower
setting is plenty. Check `/effort` before a long session.
