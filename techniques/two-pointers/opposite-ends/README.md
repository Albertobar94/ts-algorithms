# Opposite ends — two markers converging from both sides

**Start here.** This folder is one idea — put a marker at **each end** of the data and walk
them toward the middle — split into **four flavors**. If "opposite ends" is new, read this
whole page first; then pick a flavor. The four sub-folders
([`pair-sum`](./pair-sum/), [`palindrome`](./palindrome/), [`max-area`](./max-area/),
[`trapping-rain`](./trapping-rain/)) each have the recognition test, the bug-prone lines, and
runnable code.

## What it is
Put one marker at the **start** and one at the **end**. Each step you **compare the two ends**,
and the result tells you which marker to move inward. Because the data is **sorted** (so a
bigger/smaller comparison is trustworthy) or **symmetric** (a string you can read from both
sides), moving a marker can only push the result one known direction — so you never look back.
The two markers together cross the list once: one pass, **O(n)**, no extra memory.

Tiny example — *pair summing to `9`* in `[2, 7, 11, 15]`:
- `left=2`, `right=15` → `17 > 9`, too big → pull `right` in.
- `left=2`, `right=11` → `13 > 9`, still too big → pull `right` in.
- `left=2`, `right=7` → `9` → found it.

## The goal (why it exists)
The obvious way checks every pair — a loop inside a loop, about `n²` steps (1,000 items → a
million). When the data is **ordered or symmetric**, two converging markers get the same answer
in **one pass** (`n` steps), because each comparison rules out a whole batch of pairs at once
instead of one at a time.

## The four flavors (this is the fork to recognize)
Same two-marker skeleton — they differ only in **what the comparison decides**:

| Flavor | The data | The comparison each step | Which marker moves | Canonical problem |
|---|---|---|---|---|
| **[Pair sum](./pair-sum/)** | sorted numbers | sum of the two ends vs `target` | move **one** end (the helpful one) | #167 Two Sum II |
| **[Palindrome](./palindrome/)** | a string (symmetric) | are the two end chars **equal**? | move **both** ends inward | #125 Valid Palindrome, #680 Almost Palindrome |
| **[Max area](./max-area/)** | bar heights | which wall is **shorter**? | move the **shorter** wall | #11 Container With Most Water |
| **[Trapping rain](./trapping-rain/)** | bar heights | which side's running **max** is smaller? | move that (settled) side | #42 Trapping Rain Water |

## Which one? (decision guide)
- **Sorted** list + "find a pair summing to X" → **pair-sum**.
- A **string/sequence** + "reads the same both ways" (allow ≤1 deletion → Almost) → **palindrome**.
- **Bar heights** + "most water between two lines" (area = width × *shorter* wall) → **max-area**.
- **Bar heights** + "water trapped *on top of* the bars after rain" → **trapping-rain**.

A way to keep the two height ones apart: **max-area** is water *between* two chosen walls (pick
the best pair); **trapping-rain** is water *on top of every bar* (sum across all of them).

## What they all share
- Two markers, **left** at the start and **right** at the end, that only move **inward**.
- Each item is visited once → **O(n)** total, **O(1)** extra space.
- A comparison of the two ends that **points at a side to drop** — and is trustworthy only
  because the data is sorted or symmetric. Without that structure the comparison lies.

## Looks like it but ISN'T
- Two markers both going **forward** bounding a contiguous run → that's
  [`sliding-window`](../sliding-window/), not opposite ends (those don't converge).
- A pair in an **unsorted** array → no order, so the comparison can't tell you which end to
  drop; reach for the hashmap [`hashing/two-sum`](../../hashing/two-sum/). Same question,
  different trick — decided by whether the input is sorted.

---

Pick a flavor: [`pair-sum`](./pair-sum/) · [`palindrome`](./palindrome/) · [`max-area`](./max-area/) · [`trapping-rain`](./trapping-rain/).
