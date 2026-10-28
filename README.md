# Input & Work

A small interactive browser app for SE/CprE 4210 Learning Sprint 3, problem five. Three experiments explain how chosen inputs affect algorithmic work and information leakage.

## Run it

Open **index.html** in a current Chrome, Edge, Firefox, or Safari browser. No installation, build, account, or internet connection is needed. Keep `index.html`, `styles.css`, `models.js`, `app.js`, and `regex-lab.js` together.

Alternatively, from this directory:

```powershell
python -m http.server 8000
```

Open http://localhost:8000. Stop the server with Ctrl+C.

## Try the lessons

1. **Hash collisions:** Leave the count at 16 and switch from spread keys to colliding keys. Compare the buckets and total key comparisons: 8 versus 120. Move the slider and watch the growth curves. At 32 keys the counts are 48 versus 496.
2. **Mismatch-count leak:** Start with `0000`. Sweep position 1 and keep the candidate with the smallest signal. Repeat for the other positions. The other digits stay fixed during each sweep. This follows the output leak described in Sprint 3 problem two.
3. **Early-exit leak:** Switch checkers. Start with `0000` and sweep position 3. The signal is flat because an earlier mismatch prevents that position from being reached. Work from left to right instead. This follows the PIN example in Quiz 6.
4. **Fixed work:** Repeat the sweep in fixed-work mode. Equal-length inputs all produce four comparisons, although acceptance still reveals a complete match.
5. **Pattern puzzle:** Predict the number of ways to group `aaaa`, then step through the search for `aaaa!`. Finish the search, remove the suffix, and compare the result. Increase from four to five letters to see the complete groupings double. Switch to the simpler rule to remove the ambiguous grouping choices.

The public teaching PIN is `4210`; it can also be revealed in the app. It is synthetic lesson data, not a password or credential used by any service. The task is to understand the observation, not to hide a value in client-side source code.

## Model assumptions

- The hash table has eight fixed buckets, separate chaining, distinct integer keys, and the intentionally weak hash `key % 8`. Insertion checks the chain for duplicates. Only key equality comparisons are counted, not hashing, allocation, or elapsed time. Zero comparisons does not mean zero work.
- All-collision insertion takes `n(n-1)/2` equality comparisons. Evenly spread keys in eight fixed buckets eventually have quadratic total cost too. Expected linear total insertion requires table growth with a bounded load factor and suitable distribution. Simply resizing does not prevent deliberate collisions.
- The PIN models accept exactly four ASCII digits. Mismatch mode reports the number of differing positions after four comparisons. Prefix mode stops at the first mismatch and exposes comparisons as a timing proxy. Fixed mode models four comparisons without exposing mismatch counts. Internal traces are learner-only explanations, separate from observer output.
- A full match and a last-digit mismatch both take four comparisons in prefix mode. Timing alone cannot separate them; the acceptance result can.
- The pattern puzzle enumerates complete nonempty groupings of a string of a's for `^(a+)+$`. Each of the `n-1` gaps can split or join, giving `2^(n-1)` groupings. It stops after the first complete grouping on matching input and exhausts the groupings on a suffix failure. This is a small explanatory search model, not the exact order or complete partial-path count of a real regex engine. The simpler rule `^a+$` uses a direct character scan in the model. Neither pattern is actually executed by a regex engine.
- Counts are deterministic educational models, not measured timing. There are no real waits, vulnerable regex executions, remote probes, or automatic network requests. The app is bounded to 32 keys, 10 candidates per PIN sweep, and eight regex letters (at most 128 complete groupings). An optional OWASP reference link opens only when clicked.
- The fixed-work demonstration is not a production authentication implementation or proof of constant-time JavaScript. Real systems need vetted primitives and defenses suited to their platform.

## Course connections

Quiz 1 and Sprint 1 introduced confidentiality and availability. Quiz 6 connects worst-case input to algorithmic complexity attacks, poor hashes to collisions, and early-return checks to timing leakage. Sprint 3 problem two adds a distinct mismatch-count oracle. Quiz 7's input-safety concepts inform the use of DOM text nodes for displayed data.

The supplied lecture transcript explicitly encourages creative interactions, regex tracing, explanations accessible to high-school learners, and careful verification of AI output. The new prediction and grouping puzzle follows that direction. It illustrates ambiguous repetition using a smaller pattern than the email validator in question three. [OWASP's ReDoS explanation](https://community.owasp.org/attacks/Regular_expression_Denial_of_Service_-_ReDoS) gives background on nested repetition and backtracking.

The browser app implements problem five. Separately, [question-four evidence](docs/experiments/q4/REPORT.md) retains the Java experiment results used to complete the shared assignment document. The assignment allows a static browser app with meaningful interaction and requires a README and a reflection of at most one page. Those deliverables are included here.

## Files and checks

| File | Purpose |
| --- | --- |
| `index.html` | Lessons, controls, and accessible page structure |
| `styles.css` | Responsive layout and visual presentation |
| `models.js` | Bounded pure simulation models |
| `app.js` | Controls, charts, traces, and candidate sweeps |
| `regex-lab.js` | Pattern-puzzle prediction, stepping, and reset controls |
| `tests/models.test.cjs` | Tests using Node's built-in test runner |
| `reflection.md` | Brief reflection draft for student review |

Optional developer checks require Node.js 18 or newer, with no packages to install:

```powershell
node --test tests/models.test.cjs
node --check models.js
node --check app.js
node --check regex-lab.js
```

Tests cover exact collision costs, spread input, both leakage mechanisms, last-digit timing ties, fixed work, candidate sweeps, regex grouping counts, acceptance versus late failure, the simpler matcher, and input bounds. For manual review, try both slider endpoints, all checker modes, an incomplete guess, keyboard navigation, candidate selection, prediction feedback, regex step/finish/reset, and a narrow browser window.

## AI-assisted workflow and submission

AI assistance was used to read the assignment, review prior coursework, propose the teaching models, implement the app, and test it. The reflection is a draft based on that development process; revise it after trying the app so it reflects your own experience.

This working directory already points to the GitHub repository created for the assignment. Review and commit the files before submitting the repository link. If the repository is private, the assignment requires access for all team members, instructor `@atamrawi`, and TA `@adajani`. No access settings were changed by this project.
