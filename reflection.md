# Reflection

For this assignment, I used AI assistance to build a browser app about chosen inputs and program behavior. I provided the assignment, our earlier coursework, and lecture transcripts before asking for revisions. The transcripts added an important goal: make the explanation understandable to someone without much technical background. The app now includes a prediction puzzle and a step-by-step view of regex groupings instead of only displaying final results.

The pattern puzzle gives me a concrete way to explain backtracking. Four letters can be divided into eight complete groupings. Adding an exclamation mark makes every grouping fail, while removing it lets the first grouping succeed. Adding another letter doubles the possibilities. The display separates complete groupings from actual engine instructions and elapsed time. That distinction matters because a useful teaching model still has limits.

The hash-table example shows a different source of extra work. Inserting 16 spread keys takes 8 key comparisons, while inserting 16 colliding keys takes 120. The number of keys stays the same, but the links inside one bucket get longer. The PIN examples show that extra work can also reveal information. An early return exposes how far a guess gets, while reporting a mismatch count leaks information even after every digit is checked.

The workflow included tests for the models, browser checks, and an independent review against the course material. The instructor emphasized verifying AI output, so the checks targeted specific claims, such as grouping counts and the tie between a correct PIN and a last-digit mismatch. Both take four comparisons in early-exit mode.

My main takeaway is to trace what an input changes inside the program and what becomes observable outside it. The visualizations help explain those steps, but neither an attractive display nor passing tests alone establishes that a real system is secure.
