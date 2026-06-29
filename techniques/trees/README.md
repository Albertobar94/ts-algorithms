# Binary tree techniques — walk the branches, depth-first or in waves

**Start here.** These are the classic interview problems on a binary [tree](../../structures/trees/)
(read that structure note first if "node / left / right" is new). Almost all of them are one of two
walks — **DFS** (dive deep with recursion / the call stack) or **BFS** (sweep level by level with a
queue) — plus a small decision about *what to do at each node*. Each leaf has the recognition test,
the bug-prone lines, and runnable code.

## What it is
A binary tree node has a value and up to two children, `left` and `right`. You can't index it — you
**start at the root and follow pointers**. Two ways to cover every node:
- **DFS (depth-first)** — go all the way down one branch before backing up. Natural as **recursion**
  ("do this node, then recurse left and right"); the [call stack](../../structures/stack/) is the agenda.
- **BFS (breadth-first / level-order)** — visit all nodes at depth 0, then depth 1, then 2… using a
  [queue](../../structures/queue/) as the frontier (FIFO finishes a level before the next).

## The goal
Answer "how deep / what's on each level / is this ordered / how many nodes" in **one pass**, O(n)
(or better when the tree's shape lets you skip subtrees — see count-complete).

## The flavors (this is the fork to recognize)

| Problem | Walk | What you do at each node | Canonical |
|---|---|---|---|
| **[Max depth](./max-depth/)** | DFS | `1 + max(left depth, right depth)` | #104 Maximum Depth |
| **[Level order](./level-order/)** | BFS | group nodes by level (snapshot the queue size) | #102 Level Order Traversal |
| **[Right side view](./right-side-view/)** | BFS | keep the **last** node of each level | #199 Right Side View |
| **[Count complete](./count-complete/)** | DFS + heights | use perfect-subtree shortcut → O(log²n) | #222 Count Complete Tree Nodes |
| **[Validate BST](./validate-bst/)** | DFS + bounds | each node must fall in an allowed `(low, high)` | #98 Validate BST |

## Which one?
- "How tall / deepest path" → **max-depth** (DFS).
- "Process nodes level by level" / "each level as a list" → **level-order** (BFS, snapshot size).
- "What you'd see from the right (or left)" → **right-side-view** (BFS, last per level).
- "Count nodes in a *complete* tree faster than O(n)" → **count-complete** (exploit the shape).
- "Is this a valid binary *search* tree" → **validate-bst** (carry min/max bounds, not just parent compares).

## What they share
- Start at the **root**, follow `left`/`right` — no random access.
- **Base case `node === null`** — the empty subtree returns the identity (depth 0, no nodes, valid).
- DFS = recursion (watch stack depth on skewed trees); BFS = a queue and a **per-level size snapshot**
  so you know where one level ends.

## Looks like it but ISN'T
- A general **graph** (nodes with many neighbours, maybe cycles) → BFS/DFS still apply, but you need
  a **`visited` set** to avoid loops; a tree can't cycle, so tree walks skip that. (Graphs — planned.)
- "Ordered search / insert by key" → that's the **BST as a structure** ([structures/trees](../../structures/trees/)),
  not a traversal. Tell: walking *every* node (→ here) vs *halving* to one key (→ BST search)?

---

Pick a problem: [`max-depth`](./max-depth/) · [`level-order`](./level-order/) · [`right-side-view`](./right-side-view/) · [`count-complete`](./count-complete/) · [`validate-bst`](./validate-bst/).
