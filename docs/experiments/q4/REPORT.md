# Question four: verified experiment results

Source: https://github.com/atamrawi/ISU-CprE421/tree/116ac7201c793f09fba5cefab646af6a4b65fdf7/learning-sprints/sprint-3/AC-Time-Vulnerability

Upstream commit: `116ac7201c793f09fba5cefab646af6a4b65fdf7`.

Environment: Windows 11, Java 21.0.8, Java HotSpot 64-Bit Server VM. No dependencies. All runs used the same JVM version and the original program's 100 rounds. Each run starts a new JVM; the program itself clears links between rounds with `destroy()`.

## Recorded runs

| Configuration | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Original, Circle at i=3 | 9 | 6 | 6 | 12 | 8 | 2 | 7 | 5 | 13 | 9 |
| Part I, Rectangle at i=5 | 64 | 64 | 56 | 63 | 58 | 60 | 67 | 58 | 53 | 59 |
| Part II, Rectangles at i=4 and i=5 | 100 | 100 | 100 | 100 | 100 | 100 | 100 | 100 | 100 | 100 |

These are actual console results, not predicted or simulated scores. Raw console output is in `original/`, `part-I-frozen/`, and `part-II-frozen/`, each containing `run-01.txt` through `run-10.txt`. `results.json` records all results and Driver hashes; `manifest.json` records source hashes and the environment.

## Allowed source changes

Original `Driver.java` line 39 is `if(i == 3) {`; line 42 is `shapes[i] = new Circle();`.

For Part I, only these lines changed:

```java
// line 39
if(i == 5) {
// line 42
    shapes[i] = new shapes.Rectangle();
```

For Part II, only these lines changed:

```java
// line 39
if(i == 4 || i == 5) {
// line 42
    shapes[i] = new shapes.Rectangle();
```

Fully qualified type names avoid changing import lines. The original source was kept unchanged in the temporary workspace `tmp/q4/upstream/learning-sprints/sprint-3/AC-Time-Vulnerability/src/`. Original and frozen Driver copies are also retained beside the console logs here. Each final configuration was compiled once, then used without changes for its ten runs. All other source files were checked byte-for-byte against the instructor files.

## Exploration

Three preliminary runs for a single controlled Rectangle gave:

| Zero-based position | Scores |
| --- | --- |
| 0 | 16, 17, 21 |
| 1 | 9, 22, 10 |
| 2 | 23, 12, 14 |
| 3 | 19, 16, 20 |
| 4 | 15, 19, 17 |
| 5 | 64, 69, 65 |

At i=5, Circle, Hexagon, Oval, Square, and Triangle each gave zero rewards in a preliminary run. Rectangle at i=5 was therefore frozen for Part I. The theoretical per-round reward probability is `1 - (5/6)^5 = 4651/7776`, about 59.81%, assuming the uniform independent random choices intended by `ShapeUtils`.

Two-Rectangle exploration gave 100 for pairs (0,5), (3,5), and (4,5), but only 20 for (0,4) in one run each. Pair (4,5) was frozen for Part II because it makes the cycle easiest to explain.

## Root cause and trigger

`Rectangle.java` line 15 declares `private static Shape next = null;`. This is the crucial difference from the other shape classes, whose `next` fields belong to individual objects. Rectangle's `setNext()` at lines 18-19 overwrites one class-wide pointer. Its `getNext()` at lines 23-24 returns that same pointer for every Rectangle instance.

`ShapesCatalog.build()` walks through the array at lines 43-52. In particular, lines 49-50 link the previous object to the next object and advance `current`. With two Rectangles at i=4 and i=5, the call at line 49 while adding the sixth object executes `R5.setNext(R6)`. That writes `Rectangle.next = R6`. Because R6 uses the same static field, `R6.getNext()` is now R6 itself. The list traversal reaches a self-loop at the sixth object, regardless of the first four randomly generated shapes.

`ShapesCatalog.getStats()` repeatedly follows `c.getNext()` at lines 74-85. A normal six-object chain ends at null; this chain does not. The code increments a visit count at line 81 and throws `TimeLimitExceededException` at lines 82-83 when the count becomes greater than six. `Driver.java` lines 53-54 catch that exception and increment the reward. This is a cycle/nontermination trigger, not a costly hash operation or a geometric calculation.

Although the prompt calls it a timer, the supplied source does not measure elapsed time. It uses the traversal-count guard described above. The guard bounds the experiment to seven visits and prevents the demonstration from actually running forever. Results therefore do not depend on processor speed or a wall-clock timing threshold.

## Minimum shapes and proof

The minimum guaranteed input control is two Rectangle instances, with one at the final position and the other anywhere earlier. Positions five and six are a simple choice.

To see why the final position matters, suppose the last Rectangle is not the final array element. Its shared pointer is set to the following object when the catalog is built. Every Rectangle then jumps forward to that successor, so the traversal may skip shapes but cannot loop backward. If the final shape is the only Rectangle, its pointer stays null, so there is no cycle either.

When the final element is a Rectangle and another Rectangle occurs earlier, let Rp be the last earlier Rectangle. Its `setNext()` stores the reference to the following object in the shared field. No later nonfinal Rectangle overwrites that field. The final Rectangle therefore points back to that following object, whose successors lead back to the final Rectangle. This creates a reachable cycle. With adjacent Rectangles in the last two positions, the cycle is the final object's self-loop.

One controlled shape cannot guarantee the needed pair. If the controlled shape is the final Rectangle, all five random shapes might be non-Rectangles. If it is an earlier Rectangle, the random final shape might be non-Rectangle. Any controlled non-Rectangle also leaves a noncyclic completion possible. Two controlled Rectangles including the final slot guarantee the pair in every round.

## Independent exhaustive verification

`ExhaustiveCheck.java` is an auxiliary test harness, not a modification to the experiment. It constructs all `6^6 = 46656` type layouts using the original instructor classes and calls the original `getStats()` and `destroy()`. The observed reward condition matched the proof on every layout:

- All layouts: 4,651 cyclic out of 46,656.
- Original fixed Circle at i=3: 671 cyclic out of 7,776 possible remaining layouts.
- One fixed Rectangle at i=5: 4,651 cyclic out of 7,776.
- Two fixed Rectangles at i=4 and i=5: 1,296 cyclic out of 1,296.
- All 36 single-type/position controls have at least one noncyclic completion.

Full output is in `exhaustive-check.txt`. Source integrity and allowed-line checks were performed by `tmp/q4/run_experiments.py`. The committed evidence here includes the source manifest, results, original and frozen Driver files, raw final-run logs, and the independent verification harness. To rerun the harness, compile it with the instructor source at the pinned commit, then run `ExhaustiveCheck`; it uses the original classes without modifying them.
