/**
 * ============================================================================
 *  THE TRICK: reverse a singly linked list by flipping each `next` in turn
 * ============================================================================
 *
 *  Walk the list with three references — prev (already flipped), curr (flipping
 *  now), and a SAVED next (so the unflipped remainder isn't lost the instant you
 *  overwrite curr.next). Turn each arrow backward. The new head is the old tail.
 *
 *  Two ways to write the SAME reversal:
 *    A) Iterative — prev/curr/next loop      (the one to know cold)  (LeetCode #206)
 *    B) Recursive — the call stack holds prev (same #206, other lens)
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
 *  A) REVERSE LINKED LIST — ITERATIVE  (LeetCode #206)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    Given the head of a singly linked list, reverse it and return the new head.
 *
 *  Examples (as arrays):
 *    [1,2,3,4,5] -> [5,4,3,2,1]
 *    [1,2]       -> [2,1]
 *    []          -> []
 *
 *  The bug-prone bit:
 *    SAVE curr.next before rewiring it, and return `prev` (the last flipped node)
 *    — not `curr`, which is null when the loop ends.
 *
 *  Complexity:
 *    Time  O(n).  Space O(1).
 */
export function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr = head;

  while (curr !== null) {
    const next: ListNode | null = curr.next; // save before overwriting
    curr.next = prev; // flip
    prev = curr; // advance reversed part
    curr = next; // step onto saved next
  }

  return prev; // new head
}

/**
 * ----------------------------------------------------------------------------
 *  B) REVERSE LINKED LIST — RECURSIVE  (same #206, the other mental model)
 * ----------------------------------------------------------------------------
 *  Recurse to the tail; on the way back, make the next node point at us, then cut
 *  our own forward link. Base case: empty or single node returns itself.
 *
 *  Complexity:
 *    Time  O(n).  Space O(n) — the call stack (one frame per node).
 */
export function reverseListRecursive(head: ListNode | null): ListNode | null {
  if (head === null || head.next === null) {
    return head; // base case: 0 or 1 node — already reversed
  }
  const newHead = reverseListRecursive(head.next);
  head.next.next = head; // the node ahead now points back at us
  head.next = null; // cut our old forward link (becomes the new tail's null)
  return newHead;
}

// --- tiny helpers for the self-check (build from / to a plain array) ---
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

  ck("iterative [1..5] -> [5..1]", eq(toArray(reverseList(fromArray([1, 2, 3, 4, 5]))), [5, 4, 3, 2, 1]));
  ck("iterative [1,2] -> [2,1]", eq(toArray(reverseList(fromArray([1, 2]))), [2, 1]));
  ck("iterative [] -> []", eq(toArray(reverseList(fromArray([]))), []));
  ck("iterative single -> single", eq(toArray(reverseList(fromArray([7]))), [7]));

  ck("recursive [1..5] -> [5..1]", eq(toArray(reverseListRecursive(fromArray([1, 2, 3, 4, 5]))), [5, 4, 3, 2, 1]));
  ck("recursive [] -> []", eq(toArray(reverseListRecursive(fromArray([]))), []));
  ck("recursive single -> single", eq(toArray(reverseListRecursive(fromArray([7]))), [7]));

  console.log(fail === 0 ? "techniques/linked-list/reverse: all checks passed" : `${fail} FAILED`);
}
