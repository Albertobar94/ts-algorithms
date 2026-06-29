/**
 * ============================================================================
 *  THE TRICK: fast & slow pointers — two speeds expose a loop's shape
 * ============================================================================
 *
 *  Slow steps once, fast steps twice. If the chain ends, fast hits null first
 *  (no cycle). If it loops, fast gains exactly one node per step on slow, so it
 *  must land on the same node — a collision proves a cycle. O(1) space, no
 *  "seen" set. To find WHERE the loop starts, reset one pointer to the head after
 *  they meet and step both by one — they meet again at the entry (distance math).
 *
 *  Three problems on the SAME mechanic — last one isn't even a linked list:
 *    A) Linked List Cycle      — detect a loop            (LeetCode #141)
 *    B) Linked List Cycle II   — find the loop's start    (LeetCode #142)
 *    C) Find the Duplicate     — array as links, find dup (LeetCode #287, twin)
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
 *  A) LINKED LIST CYCLE  (LeetCode #141)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    Return true if the list has a cycle (some node's next points back into the
 *    list), else false.
 *
 *  The bug-prone bit:
 *    Guard `fast && fast.next` BEFORE the double step, or fast.next.next throws
 *    on a list that simply ends.
 *
 *  Complexity:
 *    Time  O(n).  Space O(1).
 */
export function hasCycle(head: ListNode | null): boolean {
  let slow = head;
  let fast = head;

  while (fast !== null && fast.next !== null) {
    slow = (slow as ListNode).next;
    fast = fast.next.next;
    if (slow === fast) {
      return true;
    }
  }

  return false;
}

/**
 * ----------------------------------------------------------------------------
 *  B) LINKED LIST CYCLE II  (LeetCode #142)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    Return the node where the cycle begins, or null if there is none.
 *
 *  Why the reset-to-head walk works (the subtle bit):
 *    Let the head→entry distance be A, and entry→meeting distance be B. When they
 *    first meet, slow has gone A+B and fast 2(A+B); fast also did some whole loops,
 *    so A+B is a multiple of the loop length. That makes A equal to "from the
 *    meeting point, the remaining distance back to the entry." So stepping one
 *    pointer from head and one from the meeting point, both by 1, lands them on
 *    the entry together.
 *
 *  Complexity:
 *    Time  O(n).  Space O(1).
 */
export function detectCycle(head: ListNode | null): ListNode | null {
  let slow = head;
  let fast = head;

  while (fast !== null && fast.next !== null) {
    slow = (slow as ListNode).next;
    fast = fast.next.next;
    if (slow === fast) {
      // Found the cycle — now find its start.
      let p = head;
      while (p !== slow) {
        p = (p as ListNode).next;
        slow = (slow as ListNode).next;
      }
      return p;
    }
  }

  return null;
}

/**
 * ----------------------------------------------------------------------------
 *  C) FIND THE DUPLICATE NUMBER  (LeetCode #287 — the far-apart twin)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    `nums` has n+1 integers each in [1, n]; exactly one value repeats (possibly
 *    many times). Find it WITHOUT modifying the array and in O(1) space.
 *
 *  Examples:
 *    [1,3,4,2,2] -> 2
 *    [3,1,3,4,2] -> 3
 *
 *  Why it's the same trick:
 *    Read the array as a linked list where index i links to index nums[i]. Since
 *    every value is in [1, n], following links from index 0 can never escape, and
 *    the duplicate value is the one ≥2 indices point AT — i.e. the entry of a
 *    cycle. So this is exactly #142: Floyd to a meeting point, then reset-to-start
 *    to find the cycle entry, which is the duplicate.
 *
 *  Complexity:
 *    Time  O(n).  Space O(1).
 */
export function findDuplicate(nums: number[]): number {
  let slow = nums[0];
  let fast = nums[0];

  // Phase 1: find a meeting point inside the cycle.
  do {
    slow = nums[slow];
    fast = nums[nums[fast]];
  } while (slow !== fast);

  // Phase 2: reset one runner to the start; step both by 1 to the entry = duplicate.
  let start = nums[0];
  while (start !== slow) {
    start = nums[start];
    slow = nums[slow];
  }

  return start;
}

// --- self-check helpers ---
function fromArray(values: number[]): ListNode | null {
  let head: ListNode | null = null;
  for (let i = values.length - 1; i >= 0; i--) {
    head = new ListNode(values[i], head);
  }
  return head;
}
// Link the tail back to the node at `index` to create a cycle (index < 0 = no cycle).
function withCycle(values: number[], index: number): { head: ListNode | null; entry: ListNode | null } {
  const head = fromArray(values);
  if (head === null) {
    return { head, entry: null };
  }
  let tail = head;
  while (tail.next !== null) {
    tail = tail.next;
  }
  if (index < 0) {
    return { head, entry: null };
  }
  let entry = head;
  for (let i = 0; i < index; i++) {
    entry = entry.next as ListNode;
  }
  tail.next = entry;
  return { head, entry };
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

  const looped = withCycle([1, 2, 3, 4], 1); // tail -> node index 1 (value 2)
  ck("hasCycle: loop -> true", hasCycle(looped.head) === true);
  ck("detectCycle: entry is node value 2", detectCycle(looped.head) === looped.entry);

  const straight = withCycle([1, 2, 3, 4], -1);
  ck("hasCycle: no loop -> false", hasCycle(straight.head) === false);
  ck("detectCycle: no loop -> null", detectCycle(straight.head) === null);

  ck("hasCycle: empty -> false", hasCycle(null) === false);
  ck("hasCycle: single no loop -> false", hasCycle(fromArray([1])) === false);

  const selfLoop = withCycle([7], 0); // single node pointing to itself
  ck("hasCycle: self-loop -> true", hasCycle(selfLoop.head) === true);
  ck("detectCycle: self-loop entry", detectCycle(selfLoop.head) === selfLoop.entry);

  ck("findDuplicate [1,3,4,2,2] -> 2", findDuplicate([1, 3, 4, 2, 2]) === 2);
  ck("findDuplicate [3,1,3,4,2] -> 3", findDuplicate([3, 1, 3, 4, 2]) === 3);
  ck("findDuplicate [2,2,2,2,2] -> 2", findDuplicate([2, 2, 2, 2, 2]) === 2);

  console.log(
    fail === 0 ? "techniques/two-pointers/fast-slow: all checks passed" : `${fail} FAILED`,
  );
}
