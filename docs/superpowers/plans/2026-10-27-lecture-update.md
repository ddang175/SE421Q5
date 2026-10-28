# Lecture-based update plan

Goal: Refine question five after reading every line of SecurityClassTranscript.txt, and complete question four in the existing Google Doc using actual Java experiments.

Context: The lecture requests creative, beginner-friendly interaction and mentions tracing regex diagrams. It also emphasizes specific questions and meaningful verification. Existing hash and PIN models remain correct.

Approach: Keep the two accurate labs, add a bounded regex grouping puzzle with prediction, stepping, and a simpler-pattern comparison. Executing an unbounded vulnerable regex is unnecessary; explicitly enumerate at most 128 groupings of up to eight letters. This is an illustrative search model, not an exact engine trace or benchmark.

Files: models.js and tests/models.test.cjs hold grouping logic; index.html, app.js, and styles.css hold the new lab; README.md and reflection.md explain the new lesson and verified workflow. No packages or services added.

Tasks:
- [x] Add failing tests for grouping counts, unique partitions, successful first grouping, late failure, simpler matcher, and bounds.
- [x] Implement the bounded model, then a predict/step/finish/reset UI with clear units and beginner explanations.
- [x] Inspect real question-four source; preserve original and restrict experimental modifications to permitted Driver.java lines.
- [x] Collect ten original, ten frozen one-shape, and ten frozen two-shape runs; verify the root cause and minimum sufficient input from code.
- [x] Write scoped question-four answers and fill native result tables in Google Docs, guarded by revision ID; verify readback.
- [x] Update documentation/reflection; run model, syntax, and browser checks; obtain independent correctness review.

Review focus: Distinguish grouping counts from runtime, benign first success from late failure, reset stale UI state, preserve existing doc questions/tables, and never invent run data.

Verification: All 11 model tests and three syntax checks passed. Browser checks covered prediction, step/finish/reset, benign first success, suffix failure, simpler-rule inspection count, and 128-group maximum. The 390px mobile layout had no horizontal overflow. Question-four tables were read back and matched all 30 raw run logs. Independent original-class Java verification covered all 46,656 layouts and confirmed the minimality proof. Native Google Docs rendering was reviewed and table widths adjusted to fit the numeric totals. Earlier document content and question-five instructions were preserved.
