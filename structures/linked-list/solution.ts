/**
 * ============================================================================
 *  THE STRUCTURE: a singly linked list — nodes wired by `next`, no address math
 * ============================================================================
 *
 *  Each node is { val, next }. Nodes sit anywhere in memory; only the pointers
 *  connect them. That single fact drives every cost:
 *    - addFirst / addLast (with a tail) / remove-at-a-known-node -> O(1)
 *      (rewire a couple of arrows, nothing shifts)
 *    - get(i) / search -> O(n)
 *      (no base + i*stride — you WALK i hops from the head)
 *
 *  This file builds the structure by hand so the self-check can EXECUTE the cost
 *  story: prepend never walks; indexing always does. The interview algorithms
 *  that rewire these pointers (reverse, m-n reversal, flatten, fast & slow) live
 *  under techniques/ — this note only models the structure they run on.
 */

class Node<T> {
  value: T;
  next: Node<T> | null = null;
  constructor(value: T) {
    this.value = value;
  }
}

export class LinkedList<T> {
  private head: Node<T> | null = null;
  private tail: Node<T> | null = null; // kept so addLast is O(1), not O(n)
  private length = 0;

  get size(): number {
    return this.length;
  }

  // O(1): make a node, point it at the old head, move head. No walking.
  addFirst(value: T): void {
    const node = new Node(value);
    node.next = this.head;
    this.head = node;
    if (this.tail === null) {
      this.tail = node; // first element is both head and tail
    }
    this.length++;
  }

  // O(1) BECAUSE we hold a tail pointer; without it this would walk to the end (O(n)).
  addLast(value: T): void {
    const node = new Node(value);
    if (this.tail === null) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }
    this.length++;
  }

  // O(n): the cost cliff — no address math, so walk `index` hops from the head.
  get(index: number): T | null {
    if (index < 0 || index >= this.length) {
      return null;
    }
    let node = this.head as Node<T>;
    for (let i = 0; i < index; i++) {
      node = node.next as Node<T>;
    }
    return node.value;
  }

  // O(1): drop the head, hand back its value.
  removeFirst(): T | null {
    if (this.head === null) {
      return null;
    }
    const value = this.head.value;
    this.head = this.head.next;
    if (this.head === null) {
      this.tail = null;
    }
    this.length--;
    return value;
  }

  toArray(): T[] {
    const out: T[] = [];
    for (let node = this.head; node !== null; node = node.next) {
      out.push(node.value);
    }
    return out;
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
  const eq = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

  const list = new LinkedList<number>();
  list.addLast(2);
  list.addLast(3);
  list.addFirst(1); // O(1) prepend → [1, 2, 3]
  ck("order after adds", eq(list.toArray(), [1, 2, 3]));
  ck("size tracks", list.size === 3);

  ck("get(0) -> 1", list.get(0) === 1);
  ck("get(2) -> 3 (walked the chain)", list.get(2) === 3);
  ck("get out of range -> null", list.get(5) === null);

  ck("removeFirst -> 1", list.removeFirst() === 1);
  ck("after remove -> [2,3]", eq(list.toArray(), [2, 3]));

  const empty = new LinkedList<number>();
  ck("empty removeFirst -> null", empty.removeFirst() === null);
  ck("empty get -> null", empty.get(0) === null);

  console.log(fail === 0 ? "structures/linked-list: all checks passed" : `${fail} FAILED`);
}
