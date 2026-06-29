# Stack techniques — solve with a last-in-first-out pile

**Start here.** These are the classic interview problems that lean on a [stack](../../structures/stack/)
(read that structure note first if "push / pop / LIFO" is new). They're all the same instinct —
**keep a pile, and let the newest item drive the next decision** — split into a few shapes. Each leaf
has the recognition test, the bug-prone lines, and runnable code.

## What it is
A **stack** is a pile you only touch at the top: `push` to add, `pop` to take the most recent off
(last in, first out). Reach for one when the thing you must act on is the thing you saw **most
recently** — a closer must match the latest opener, a backspace deletes the last char, the front of
a queue is the bottom of a reversed pile.

## The goal
Replace "scan back to find the most recent relevant item" (an O(n) look-behind on every step) with
a **single O(1) `pop`** — the pile already has the most-recent item on top.

## The moves (this is the fork to recognize)

| Move | What the stack holds | Reach for it when | Canonical problem |
|---|---|---|---|
| **Bracket matching** | open brackets awaiting their close | "is the nesting valid / balanced?" | #20 Valid Parentheses — built as `isBalanced` in the [structure note](../../structures/stack/) |
| **[Minimum remove brackets](./min-remove-brackets/)** | **indices** of unmatched `(` | "delete the fewest chars to make it valid" | #1249 Minimum Remove to Make Valid Parentheses |
| **[Queue from two stacks](./queue-from-two-stacks/)** | an `in` pile + an `out` pile | "build a FIFO queue using only LIFO stacks" | #232 Implement Queue using Stacks |

> Bracket *matching* itself (#20) lives in the [stack structure note](../../structures/stack/) as
> `isBalanced` — the canonical proof of *why* the structure is LIFO. The moves here build on it.

## Which one?
- "Is this nesting balanced?" → bracket matching (`isBalanced`, in the structure note).
- "Remove the fewest brackets to make it valid" → **min-remove-brackets** (track the *positions* to drop).
- "FIFO behaviour but only stacks allowed" → **queue-from-two-stacks** (reverse once, lazily).

## What they share
- A pile touched only at the **top**; `push` / `pop` are O(1), nothing shifts.
- The decision each step depends on the **most recent** kept item — that's the whole reason it's a stack, not a queue.
- **Guard the empty pop** — popping when the pile is empty is the classic crash; decide up front (skip vs error).

## Looks like it but ISN'T
- Process items **oldest-first** (a wave, a frontier) → that's a **queue** ([structure note](../../structures/queue/)); a stack gives you newest-first.
- "Next greater / warmer element", histogram rectangles → a **monotonic stack** (keep the pile sorted, pop as a bigger value arrives) — a stack variant, planned.
- Matching across the **whole** string for a *count* only (no positions) → a counter may beat a stack; you only need the pile when you must know *which* items to act on.

---

Pick a move: bracket matching (in the [structure note](../../structures/stack/)) · [`min-remove-brackets`](./min-remove-brackets/) · [`queue-from-two-stacks`](./queue-from-two-stacks/).
