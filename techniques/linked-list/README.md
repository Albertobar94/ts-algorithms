# Linked-list techniques — rewire the pointers without losing the chain

**Start here.** These are the classic interview moves on a [linked list](../../structures/linked-list/)
(read that structure note first if "node / `next` pointer" is new). They're all the same skill —
**rewire pointers in the right order**, saving what you're about to overwrite — split into a few
shapes. Each leaf has the recognition test, the bug-prone lines, and runnable code.

## What it is
A linked list has no random access: you hold the **head** and walk **forward**, and the rest of the
chain hangs off whatever node you're touching. So every edit is a careful little pointer dance —
**save `next` before you overwrite it**, use a **dummy head** so the first node isn't a special
case, and walk with the **right number of cursors**. Get the order wrong and you either drop half
the list or build a loop.

## The goal
Do the edit **in place, in one pass, O(1) extra space** — no copying values into an array (which
would throw away the whole point of the structure).

## The moves (this is the fork to recognize)

| Move | What you do to the pointers | Reach for it when | Canonical problem |
|---|---|---|---|
| **[Reverse](./reverse/)** | flip every `next` to point backward | "reverse the list" — and the building block for the rest | #206 Reverse Linked List |
| **[M-to-N reversal](./mn-reversal/)** | reverse only positions `m..n`, splice back in | "reverse *part* of the list, in place, one pass" | #92 Reverse Linked List II |
| **[Flatten multilevel DLL](./merge-multilevel-dll/)** | splice each `child` list inline, depth-first | a doubly-linked list whose nodes have **child** lists | #430 Flatten a Multilevel Doubly Linked List |

> Cycle / middle / duplicate questions (#141, #142, #876, #287) are the **fast & slow pointer**
> move — two cursors at different speeds — which lives under
> [`two-pointers/fast-slow`](../two-pointers/fast-slow/), since it's a pointer-*speed* trick, not a
> rewiring one. The linked list is its home turf, so the structure note links there too.

## Which one?
- "Reverse the whole thing" → **reverse** (master the prev/curr/next dance first).
- "Reverse from position m to n" → **mn-reversal** (reverse + a dummy head + careful counting).
- Nodes have a **child** pointer into a sub-list → **flatten multilevel DLL**.
- "Does it loop / where / what's the middle / find the duplicate" → [`fast-slow`](../two-pointers/fast-slow/).

## What they share
- You hold the **head** and walk **forward** — no jumping to an index.
- **Save `next` before you overwrite it**, or the rest of the chain is lost — the #1 linked-list bug.
- A **dummy/sentinel node** in front of the head removes the "what if the first node changes?" case.
- Doubly-linked variants must fix **`prev` as well as `next`** — forgetting the back-pointer is the #430 trap.

## Looks like it but ISN'T
- Reversing or pairing an **array** in place → swap by **index** ([`opposite-ends`](../two-pointers/opposite-ends/)); an array *can* index, a singly linked list can't, so it's this splice instead.
- **Merging two sorted lists** (#21) walks linked nodes too, but interleaves two inputs by value — a [`two-pointers`](../two-pointers/) merge, not a rewiring of one chain.

---

Pick a move: [`reverse`](./reverse/) · [`mn-reversal`](./mn-reversal/) · [`merge-multilevel-dll`](./merge-multilevel-dll/).
