/**
 * ============================================================================
 *  THE TRICK: reverse only positions m..n in place, via head-insertion
 * ============================================================================
 *
 *  Put a DUMMY node before the head so "the node before the window" is always a
 *  real handle (even when m == 1). Walk `prev` to just before position m. Then,
 *  n-m times, lift the node right after `curr` out of the chain and re-insert it
 *  immediately after `prev`. Repeatedly moving "the next one" to the window's
 *  front turns the window inside out — one pass, O(1) space.
 *
 *  A) Reverse Linked List II — reverse positions m..n   (LeetCode #92)
 *
 *  Node shape (each note is self-contained, so we declare it locally):
 */
class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val: number, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

/**
 * ----------------------------------------------------------------------------
 *  A) REVERSE LINKED LIST II  (LeetCode #92)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    Reverse the nodes from position `m` to `n` (1-indexed) and return the head.
 *
 *  Examples (as arrays):
 *    [1,2,3,4,5], m=2, n=4 -> [1,4,3,2,5]
 *    [5],         m=1, n=1 -> [5]            (m == n: reverse nothing)
 *    [1,2,3],     m=1, n=3 -> [3,2,1]        (m == 1: dummy earns its keep)
 *
 *  The bug-prone bits:
 *    - dummy before head so m == 1 isn't special;
 *    - advance prev EXACTLY m-1 steps;
 *    - do EXACTLY n-m lifts;
 *    - the three-line splice (curr.next = next.next; next.next = prev.next;
 *      prev.next = next) must run in that order.
 *
 *  Complexity:
 *    Time  O(n).  Space O(1).
 */
export function reverseBetween(
  head: ListNode | null,
  m: number,
  n: number,
): ListNode | null {
  const dummy = new ListNode(0);
  dummy.next = head;
  let prev: ListNode = dummy;

  for (let i = 0; i < m - 1; i++) {
    // prev must stop just BEFORE position m.
    prev = prev.next as ListNode;
  }

  const curr = prev.next as ListNode; // first window node — sinks to the end

  for (let i = 0; i < n - m; i++) {
    const next = curr.next as ListNode; // node to lift to the front
    curr.next = next.next; // splice `next` out
    next.next = prev.next; // point it at the current window front
    prev.next = next; // hook it right after prev
  }

  return dummy.next;
}

// --- tiny helpers for the self-check ---
function fromArray(values: number[]): ListNode | null {
  let head: ListNode | null = null;
  for (let i = values.length - 1; i >= 0; i--) {
    head = new ListNode(values[i], head);
  }
  return head;
}
function toArray(head: ListNode | null): number[] {
  const out: number[] = [];
  for (let node = head; node !== null; node = node.next) {
    out.push(node.val);
  }
  return out;
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

  ck("middle [1..5] m2 n4 -> [1,4,3,2,5]", eq(toArray(reverseBetween(fromArray([1, 2, 3, 4, 5]), 2, 4)), [1, 4, 3, 2, 5]));
  ck("single m1 n1 -> [5]", eq(toArray(reverseBetween(fromArray([5]), 1, 1)), [5]));
  ck("whole m1 n3 -> [3,2,1]", eq(toArray(reverseBetween(fromArray([1, 2, 3]), 1, 3)), [3, 2, 1]));
  ck("prefix m1 n2 -> [2,1,3]", eq(toArray(reverseBetween(fromArray([1, 2, 3]), 1, 2)), [2, 1, 3]));
  ck("suffix m2 n3 -> [1,3,2]", eq(toArray(reverseBetween(fromArray([1, 2, 3]), 2, 3)), [1, 3, 2]));

  console.log(fail === 0 ? "techniques/linked-list/mn-reversal: all checks passed" : `${fail} FAILED`);
}
