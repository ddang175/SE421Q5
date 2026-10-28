# Input & Work Lab Implementation Plan

**Goal:** Complete Sprint 3 problem five with an offline browser app, README, and a reflection under one page.

**Architecture:** Plain HTML, CSS, and classic JavaScript, with a pure model shared by the browser and Node tests. No services, dependencies, or private data.

**Spec:** Problem five in the supplied Sprint 3 document. The user requested autonomous implementation in this repository after reviewing past coursework.

**Design:** Two connected lessons show how input changes work. Hash flooding uses eight chained buckets and counts equality comparisons before inserting distinct integer keys. A public four-digit toy PIN supports the assignment's mismatch-count signal, Quiz 6's prefix timing signal, and a fixed-work model. Visible signals are explicitly distinguished from internal work. No actual waits or external targets.

**Approaches:** A real vulnerable regex could stall the UI; a formula-only complexity chart offers less concrete interaction. Chained buckets provide exact, small operation counts and directly connect to Quiz 6. Use a small static app so opening index.html is enough.

**Constraints:** All inputs bounded; learner text rendered safely; keyboard-accessible controls; mobile layout; no dependencies; no em dashes in reflection. Reflection describes the actual AI-assisted workflow and remains a draft for the student's review.

**Review focus:** Last-character mismatch versus full match; wrong-length guesses; flat signals with an incorrect prefix; slider endpoints; local file loading.

## Tasks

- [x] Write and run failing Node tests for collision work, distributions, PIN signals, boundaries, and candidate sweeps.
- [x] Implement `models.js` with `hashExperiment(count, pattern)`, `checkPin(guess, mode)`, and `sweep(guess, position, mode)`; rerun tests.
- [x] Build `index.html`, `styles.css`, and `app.js`: bucket display, cost chart, guess trace, candidate sweep, mode explanations, and learner challenges.
- [x] Create README with run steps, teaching assumptions, checks, and assignment mapping. Write a brief reflection based on actual work, without invented student experiences.
- [x] Verify tests, syntax, and browser interaction at desktop and mobile sizes; review against assignment requirements.

## Execution notes

Implementation stays in the user's specified empty repository so the user can run it there. Research subagents covered all nine supplied PDFs. No push, collaborator changes, or publishing is needed for local review.

Verification: Seven model tests and both JavaScript syntax checks passed. Chrome checks covered distribution switching, candidate adoption, prefix ambiguity, fixed-work sweeps, invalid input, full matches, and keyboard slider endpoints. Desktop and 390px viewport screenshots were inspected; no horizontal overflow occurred. Direct file URL testing was blocked by browser tool policy; local assets and classic deferred scripts support opening index.html without a server. Independent review found no blocking issues.
