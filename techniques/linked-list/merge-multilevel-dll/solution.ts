/**
 * ============================================================================
 *  THE TRICK: flatten a multilevel list — depth-first splice via a stack
 * ============================================================================
 *
 *  Some nodes drop into a `child` sub-list. Flattening means each child list
 *  appears between its parent and the parent's old `next`, recursively. Walk with
 *  a STACK: push the parent's `next` (for later) then its `child` (to visit
 *  first). LIFO order = depth-first. Wire BOTH next and prev, and clear `child`.
 *  Each node is pushed/popped once → O(n).
 *
 *  Two problems on the SAME depth-first splice, far apart in domain:
 *    A) Flatten Multilevel Doubly Linked List — pointers   (LeetCode #430)
 *    B) Flatten a nested array               — plain data  (#341 in spirit)
 *
 *  Node shape (each note is self-contained, so we declare it locally):
 */
class MultiNode {
  val: number;
  prev: MultiNode | null = null;
  next: MultiNode | null = null;
  child: MultiNode | null = null;
  constructor(val: number) {
    this.val = val;
  }
}

/**
 * ----------------------------------------------------------------------------
 *  A) FLATTEN A MULTILEVEL DOUBLY LINKED LIST  (LeetCode #430)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    Doubly linked list; some nodes have a `child` pointing to a separate doubly
 *    linked list (which may itself have children). Flatten into a single-level
 *    list: each child list goes right after its parent and before the parent's
 *    next, depth-first. Set all `child` pointers to null. Return the head.
 *
 *  Example (vals):
 *    1-2-3-4-5-6, 3.child = 7-8-9-10, 8.child = 11-12
 *      -> 1,2,3,7,8,11,12,9,10,4,5,6
 *
 *  The bug-prone bits:
 *    - push `next` BEFORE `child` so the child pops first (depth-first);
 *    - set BOTH prev.next and curr.prev (it's doubly linked);
 *    - null out every `child`;
 *    - the head's prev is never touched, so it stays null.
 *
 *  Complexity:
 *    Time  O(n) — each node pushed and popped once.  Space O(n) for the stack.
 */
export function flatten(head: MultiNode | null): MultiNode | null {
  if (head === null) {
    return null;
  }

  const stack: MultiNode[] = [head];
  let prev: MultiNode | null = null;

  while (stack.length > 0) {
    const curr = stack.pop() as MultiNode;

    if (prev !== null) {
      prev.next = curr;
      curr.prev = prev;
    }

    if (curr.next !== null) {
      stack.push(curr.next); // visited after the child branch
    }
    if (curr.child !== null) {
      stack.push(curr.child); // popped first → depth-first
      curr.child = null; // #430 requires this cleared
    }

    prev = curr;
  }

  return head;
}

/**
 * ----------------------------------------------------------------------------
 *  B) FLATTEN A NESTED ARRAY  (the far-apart twin — same depth-first splice)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    Given a list whose items are numbers or further nested lists, produce the
 *    numbers in depth-first order.
 *
 *  Examples:
 *    [1,[2,[3,4]],5]  -> [1,2,3,4,5]
 *    [[1,2],[3,[4]]]  -> [1,2,3,4]
 *
 *  Same idea as #430: when an item is itself a list (the "child"), you expand it
 *  right where it sits, before moving on to the siblings after it — depth-first.
 *
 *  Complexity:
 *    Time  O(total items).  Space O(depth) for recursion.
 */
type Nested = number | Nested[];

export function flattenNested(items: Nested[]): number[] {
  const out: number[] = [];
  for (const item of items) {
    if (Array.isArray(item)) {
      out.push(...flattenNested(item)); // dive into the child sequence in place
    } else {
      out.push(item);
    }
  }
  return out;
}

// --- self-check helpers ---
function buildDoubly(values: number[]): MultiNode | null {
  let head: MultiNode | null = null;
  let prev: MultiNode | null = null;
  for (const v of values) {
    const node = new MultiNode(v);
    node.prev = prev;
    if (prev !== null) {
      prev.next = node;
    } else {
      head = node;
    }
    prev = node;
  }
  return head;
}
function nodeAt(head: MultiNode | null, index: number): MultiNode {
  let node = head as MultiNode;
  for (let i = 0; i < index; i++) {
    node = node.next as MultiNode;
  }
  return node;
}
function toVals(head: MultiNode | null): number[] {
  const out: number[] = [];
  for (let node = head; node !== null; node = node.next) {
    out.push(node.val);
  }
  return out;
}
// Verify prev pointers are consistent end-to-end (the #430 trap).
function prevPointersOk(head: MultiNode | null): boolean {
  if (head === null) {
    return true;
  }
  if (head.prev !== null) {
    return false; // head must have no prev
  }
  for (let node = head; node.next !== null; node = node.next) {
    if (node.next.prev !== node) {
      return false;
    }
  }
  return true;
}

// ---------------------------------------------------------------------------
// Quick self-check — run with:  npx tsx solution.ts
// ---------------------------------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  let fail = 0;
  const ck = (name: string, cond: boolean): void => {
    if (!cond) {
      fail++;
      console.log("FAIL:", name);
    }
  };
  const eq = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

  // Build the canonical #430 example.
  const main = buildDoubly([1, 2, 3, 4, 5, 6]);
  const child7 = buildDoubly([7, 8, 9, 10]);
  const child11 = buildDoubly([11, 12]);
  nodeAt(main, 2).child = child7; // node 3 -> child 7..10
  nodeAt(child7, 1).child = child11; // node 8 -> child 11..12

  const flat = flatten(main);
  ck("flatten #430 example", eq(toVals(flat), [1, 2, 3, 7, 8, 11, 12, 9, 10, 4, 5, 6]));
  ck("flatten prev pointers consistent", prevPointersOk(flat));
  ck("flatten clears child", nodeAt(flat, 2).child === null && nodeAt(flat, 4).child === null);
  ck("flatten empty -> null", flatten(null) === null);

  const single = buildDoubly([1]);
  ck("flatten single -> [1]", eq(toVals(flatten(single)), [1]));

  ck("nested [1,[2,[3,4]],5]", eq(flattenNested([1, [2, [3, 4]], 5]), [1, 2, 3, 4, 5]));
  ck("nested [[1,2],[3,[4]]]", eq(flattenNested([[1, 2], [3, [4]]]), [1, 2, 3, 4]));

  console.log(
    fail === 0 ? "techniques/linked-list/merge-multilevel-dll: all checks passed" : `${fail} FAILED`,
  );
}
