/**
 * ============================================================================
 *  THE TRICK: a FIFO queue built from two LIFO stacks (reverse once, lazily)
 * ============================================================================
 *
 *  A stack pops newest-first; pour it into a SECOND stack and that pops
 *  oldest-first. Keep an `in` stack for pushes and an `out` stack for removals.
 *  Refill `out` from `in` ONLY when `out` is empty — so each item is pushed once
 *  and moved once. A single pop can be O(n), but across all ops it's amortized
 *  O(1). The laziness (transfer only when needed) is the whole trick.
 *
 *  A) Implement Queue using Stacks  (LeetCode #232)
 *
 * ----------------------------------------------------------------------------
 *  A) MY QUEUE  (LeetCode #232)
 * ----------------------------------------------------------------------------
 *  Operations: push(x), pop() -> oldest, peek() -> oldest, empty().
 *
 *  Example:
 *    push(1); push(2); peek()->1; pop()->1; empty()->false; pop()->2; empty()->true
 *
 *  Why transfer only when `out` is empty (the subtle bit):
 *    If `out` still holds older items and we pour newer ones on top, the newer
 *    would be served first — FIFO broken. Refilling an EMPTY `out` guarantees
 *    everything already in `out` (older) leaves before anything in `in` (newer)
 *    is moved.
 *
 *  Complexity:
 *    push O(1); pop/peek amortized O(1) (each element transferred at most once).
 *    Space O(n).
 */
export class MyQueue<T> {
  private readonly inStack: T[] = []; // new pushes pile here (newest on top)
  private readonly outStack: T[] = []; // removals served here (oldest on top after a transfer)

  push(x: T): void {
    this.inStack.push(x);
  }

  // Refill out from in ONLY when out is empty; move ALL of in so order is preserved.
  private transfer(): void {
    if (this.outStack.length === 0) {
      while (this.inStack.length > 0) {
        this.outStack.push(this.inStack.pop() as T); // pop in / push out → reverses → FIFO
      }
    }
  }

  // Remove and return the oldest element. (Assumes non-empty, per #232.)
  pop(): T {
    this.transfer();
    return this.outStack.pop() as T;
  }

  // Look at the oldest element without removing it.
  peek(): T {
    this.transfer();
    return this.outStack[this.outStack.length - 1] as T;
  }

  empty(): boolean {
    return this.inStack.length === 0 && this.outStack.length === 0;
  }
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

  const q = new MyQueue<number>();
  ck("starts empty", q.empty() === true);
  q.push(1);
  q.push(2);
  ck("peek oldest -> 1", q.peek() === 1);
  ck("pop oldest -> 1", q.pop() === 1);
  ck("not empty after one pop", q.empty() === false);
  q.push(3); // exercise: push while out-stack mid-serve
  ck("pop -> 2 (still FIFO across a later push)", q.pop() === 2);
  ck("pop -> 3", q.pop() === 3);
  ck("empty again", q.empty() === true);

  // Interleaved stress: push 1..5, pop should yield 1..5 in order.
  const q2 = new MyQueue<number>();
  q2.push(1);
  q2.push(2);
  ck("q2 pop 1", q2.pop() === 1);
  q2.push(3);
  q2.push(4);
  ck("q2 pop 2", q2.pop() === 2);
  ck("q2 pop 3", q2.pop() === 3);
  q2.push(5);
  ck("q2 pop 4", q2.pop() === 4);
  ck("q2 pop 5", q2.pop() === 5);
  ck("q2 empty", q2.empty() === true);

  console.log(
    fail === 0 ? "techniques/stack/queue-from-two-stacks: all checks passed" : `${fail} FAILED`,
  );
}
