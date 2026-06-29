/**
 * ============================================================================
 *  THE STRUCTURE: an array is a CONTIGUOUS BLOCK OF MEMORY
 * ============================================================================
 *
 *  "Array" = one unbroken row of equal-size slots in memory, back to back.
 *  That single fact explains every cost:
 *
 *    - INDEX is O(1).  Slot i lives at  base_address + i * slot_size.  One
 *      multiply + one add -> jump straight there. No scan. This is the whole
 *      reason binary search / two-pointers / sliding-window / prefix-sum can
 *      exist: they all assume "give me item i" is free.
 *
 *    - PUSH is amortized O(1).  A block has a fixed CAPACITY. Fill it, and the
 *      next push can't just "extend" -- the next bytes belong to someone else.
 *      So you allocate a NEW, bigger block (double it) and COPY everything over.
 *      A single push can be O(n), but doubling makes copies rare: n pushes do
 *      ~2n copies total -> O(1) each on average. That averaged-out cost is what
 *      "amortized" means.
 *
 *    - INSERT / REMOVE in the MIDDLE is O(n).  Slots are packed with no gaps,
 *      so to open (or close) a hole at index i you must SHIFT every later
 *      element by one. Half the array moves on average.
 *
 *  THE ABSTRACTION vs THE METAL.  A real C array is exactly this block. A JS
 *  `Array` is NOT -- the engine (V8) gives you the contiguous-block behaviour
 *  *when it can* (a "packed elements" array), but the moment you leave holes
 *  (`a[100] = x` on a short array) or mix types badly, it silently falls back
 *  to a hash-map-backed "dictionary elements" array: indexing quietly becomes a
 *  hash lookup, not a pointer jump. You never see the switch; you only feel it
 *  as code that mysteriously got slower. Same lesson as a "file": JS hands you
 *  a clean abstraction over a messy physical reality, and the reality leaks
 *  through as cost.
 *
 *  Below: DynamicArray<T> -- the resizable array V8 gives you for free, built
 *  by hand over a FIXED backing buffer so the cost story is *executed*, not
 *  asserted. `push` doubles on overflow; `insertAt`/`removeAt` shift.
 *
 *  Language trap: this models a fixed buffer with `new Array(capacity)`. A
 *  plain JS array would grow on its own and hide the very lesson we're showing.
 */

export class DynamicArray<T> {
  // Fixed-size backing block. Only indices [0, length) hold live values;
  // the rest is reserved capacity waiting to be filled.
  private buffer: Array<T | undefined>;
  private length: number;
  private resizeCount: number;

  public constructor(initialCapacity: number = 4) {
    // A real block always has a non-zero size; guard against 0/negative.
    const cap = initialCapacity > 0 ? initialCapacity : 1;
    this.buffer = new Array<T | undefined>(cap);
    this.length = 0;
    this.resizeCount = 0;
  }

  public get size(): number {
    return this.length;
  }

  public get capacity(): number {
    return this.buffer.length;
  }

  // Number of times the block was reallocated -- proof that doubling keeps
  // resizes logarithmic in the number of pushes (the "amortized" claim).
  public get resizes(): number {
    return this.resizeCount;
  }

  // O(1): jump straight to slot i. The defining superpower of an array.
  public get(index: number): T {
    this.assertInBounds(index, this.length);
    // Safe: assertInBounds guarantees index < length, so the slot is live.
    return this.buffer[index] as T;
  }

  // O(1): overwrite an existing slot in place.
  public set(index: number, value: T): void {
    this.assertInBounds(index, this.length);
    this.buffer[index] = value;
  }

  // Amortized O(1): append. Grows (doubles) only when the block is full.
  public push(value: T): void {
    if (this.length === this.buffer.length) {
      this.grow();
    }
    this.buffer[this.length] = value;
    this.length += 1;
  }

  // O(n): open a hole at index by shifting every later element right by one.
  public insertAt(index: number, value: T): void {
    // Insert is valid at [0, length] -- length itself means "append".
    this.assertInBounds(index, this.length + 1);
    if (this.length === this.buffer.length) {
      this.grow();
    }
    // Walk from the back so we don't overwrite values we still need to move.
    for (let i = this.length; i > index; i -= 1) {
      this.buffer[i] = this.buffer[i - 1];
    }
    this.buffer[index] = value;
    this.length += 1;
  }

  // O(n): close the hole at index by shifting every later element left by one.
  public removeAt(index: number): T {
    this.assertInBounds(index, this.length);
    const removed = this.buffer[index] as T;
    for (let i = index; i < this.length - 1; i += 1) {
      this.buffer[i] = this.buffer[i + 1];
    }
    this.length -= 1;
    // Drop the now-stale reference in the freed slot (avoid leaking it).
    this.buffer[this.length] = undefined;
    return removed;
  }

  public toArray(): T[] {
    const out: T[] = [];
    for (let i = 0; i < this.length; i += 1) {
      out.push(this.buffer[i] as T);
    }
    return out;
  }

  // Allocate a block twice as big and copy everything over -- the O(n) step
  // that doubling makes rare enough to average out to O(1) per push.
  private grow(): void {
    const newBuffer = new Array<T | undefined>(this.buffer.length * 2);
    for (let i = 0; i < this.length; i += 1) {
      newBuffer[i] = this.buffer[i];
    }
    this.buffer = newBuffer;
    this.resizeCount += 1;
  }

  // Reject out-of-range / non-integer indices before touching the buffer.
  private assertInBounds(index: number, upperExclusive: number): void {
    if (!Number.isInteger(index) || index < 0 || index >= upperExclusive) {
      throw new RangeError(`index ${index} out of range [0, ${upperExclusive})`);
    }
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

  // --- amortized push: doubling keeps the block growing 2,4,8,... -----------
  const a = new DynamicArray<number>(2);
  ck("starts empty", a.size === 0 && a.capacity === 2);
  a.push(10);
  a.push(20);
  ck("filled to capacity, no resize yet", a.size === 2 && a.capacity === 2 && a.resizes === 0);
  a.push(30); // overflow -> double 2->4
  ck("push past cap doubles 2->4", a.capacity === 4 && a.resizes === 1);
  a.push(40);
  a.push(50); // overflow -> double 4->8
  ck("push past cap doubles 4->8", a.capacity === 8 && a.resizes === 2);
  ck("values intact across resizes", a.toArray().join(",") === "10,20,30,40,50");
  ck("5 pushes -> only 2 resizes (log, not linear)", a.resizes === 2);

  // --- O(1) index -----------------------------------------------------------
  ck("get(0) -> 10", a.get(0) === 10);
  ck("get(4) -> 50", a.get(4) === 50);
  a.set(0, 99);
  ck("set(0,99)", a.get(0) === 99);

  // --- O(n) middle insert/remove: shifting preserves order ------------------
  const b = new DynamicArray<string>(4);
  b.push("a");
  b.push("c");
  b.insertAt(1, "b"); // open a hole in the middle
  ck("insertAt middle shifts right", b.toArray().join("") === "abc");
  b.insertAt(b.size, "d"); // insert at length == append
  ck("insertAt length appends", b.toArray().join("") === "abcd");
  const gone = b.removeAt(0); // close the hole at the front
  ck("removeAt returns the value", gone === "a");
  ck("removeAt shifts left", b.toArray().join("") === "bcd");

  // --- edges ----------------------------------------------------------------
  const c = new DynamicArray<number>(1);
  ck("empty toArray", c.toArray().length === 0);
  let threw = false;
  try {
    c.get(0);
  } catch {
    threw = true;
  }
  ck("get out of range throws", threw);
  c.push(7);
  ck("one item", c.size === 1 && c.get(0) === 7);
  ck("removeAt last leaves empty", c.removeAt(0) === 7 && c.size === 0);

  console.log(fail === 0 ? "structures/array: all checks passed" : `${fail} FAILED`);
}
