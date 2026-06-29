/**
 * ============================================================================
 *  THE TRICK: QuickSelect — partition, then recurse into ONLY one side
 * ============================================================================
 *
 *  QuickSort partitions around a pivot and recurses into BOTH halves. To find
 *  just the k-th element you don't need both: after partitioning, the pivot sits
 *  at its FINAL sorted index p (smaller left, larger right). Compare p to the
 *  index you want — the answer is entirely on one side, so recurse into that one
 *  and discard the other. Halving the work each step (on average) gives O(n)
 *  average time vs O(n log n) for a full sort.
 *
 *  Two algorithms sharing ONE partition — the difference is one vs both sides:
 *    A) Kth Largest — QuickSelect, recurse ONE side   (LeetCode #215)
 *    B) Sort an Array — QuickSort, recurse BOTH sides  (LeetCode #912, the twin)
 *
 *  Note: both REORDER the input. The public wrappers clone first so callers (and
 *  the self-check) aren't surprised.
 */

function swap(nums: number[], i: number, j: number): void {
  const tmp = nums[i];
  nums[i] = nums[j];
  nums[j] = tmp;
}

/**
 * Lomuto partition over the inclusive slice [lo, hi]:
 *   - pick a RANDOM pivot (swap it to hi) so sorted input doesn't degrade to O(n²);
 *   - move every value < pivot to the left of a cursor `i`;
 *   - drop the pivot into slot i — its final sorted position — and return i.
 */
function partition(nums: number[], lo: number, hi: number): number {
  // Random pivot in [lo, hi]. Math.random is fine in a normal Node script.
  const pivotIndex = lo + Math.floor(Math.random() * (hi - lo + 1));
  swap(nums, pivotIndex, hi);

  const pivot = nums[hi];
  let i = lo; // next slot for a "< pivot" value
  for (let j = lo; j < hi; j++) {
    if (nums[j] < pivot) {
      swap(nums, i, j);
      i++;
    }
  }
  swap(nums, i, hi); // pivot to its final sorted slot
  return i;
}

/**
 * ----------------------------------------------------------------------------
 *  A) KTH LARGEST ELEMENT  (LeetCode #215)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    Return the k-th largest element in `nums` (k is 1-based). Order statistic —
 *    the array need not end up sorted.
 *
 *  Examples:
 *    [3,2,1,5,6,4], k=2 -> 5
 *    [3,2,3,1,2,4,5,5,6], k=4 -> 4
 *    [1], k=1 -> 1
 *
 *  Key: the k-th LARGEST sits at ascending index n - k. Partition, then recurse
 *  into ONLY the side that contains that index.
 *
 *  Complexity:
 *    Time  O(n) average (halve each step), O(n²) worst (mitigated by random pivot).
 *    Space O(1) extra beyond the recursion (clone aside).
 */
function quickSelect(nums: number[], lo: number, hi: number, target: number): number {
  const p = partition(nums, lo, hi);
  if (p === target) {
    return nums[p];
  }
  if (p < target) {
    return quickSelect(nums, p + 1, hi, target); // answer is to the right
  }
  return quickSelect(nums, lo, p - 1, target); // answer is to the left
}

export function findKthLargest(nums: number[], k: number): number {
  const copy = [...nums]; // don't mutate the caller's array
  return quickSelect(copy, 0, copy.length - 1, copy.length - k);
}

/**
 * ----------------------------------------------------------------------------
 *  B) QUICKSORT  (LeetCode #912 — the twin: same partition, BOTH sides)
 * ----------------------------------------------------------------------------
 *  The contrast that makes QuickSelect click: identical partition, but recurse
 *  into LEFT and RIGHT (not one) → the whole array ends sorted, O(n log n) avg.
 *
 *  Complexity:
 *    Time  O(n log n) average, O(n²) worst.  Space O(log n) recursion.
 */
function quickSortInPlace(nums: number[], lo: number, hi: number): void {
  if (lo >= hi) {
    return; // 0 or 1 element — base case
  }
  const p = partition(nums, lo, hi);
  quickSortInPlace(nums, lo, p - 1); // both sides — that's the only difference
  quickSortInPlace(nums, p + 1, hi);
}

export function sortArray(nums: number[]): number[] {
  const copy = [...nums];
  quickSortInPlace(copy, 0, copy.length - 1);
  return copy;
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

  ck("kth largest [3,2,1,5,6,4] k2 -> 5", findKthLargest([3, 2, 1, 5, 6, 4], 2) === 5);
  ck("kth largest with dups k4 -> 4", findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4) === 4);
  ck("kth largest single -> 1", findKthLargest([1], 1) === 1);
  ck("kth largest k=1 (max)", findKthLargest([7, 6, 5, 4, 3, 2, 1], 1) === 7);
  ck("kth largest k=n (min)", findKthLargest([7, 6, 5, 4, 3, 2, 1], 7) === 1);

  // Cross-check against the built-in sort over a few inputs (random pivot → run a handful).
  const inputs = [
    [3, 2, 1, 5, 6, 4],
    [5, 5, 5, 5],
    [10, -1, 2, 0, -3, 8],
    [1, 2, 3, 4, 5, 6, 7, 8],
  ];
  for (const arr of inputs) {
    const sorted = [...arr].sort((a, b) => a - b);
    ck(`quickSort matches builtin on ${JSON.stringify(arr)}`, eq(sortArray(arr), sorted));
    for (let k = 1; k <= arr.length; k++) {
      ck(`kth largest k=${k} on ${JSON.stringify(arr)}`, findKthLargest(arr, k) === sorted[arr.length - k]);
    }
  }

  console.log(
    fail === 0 ? "paradigms/recursion/quickselect: all checks passed" : `${fail} FAILED`,
  );
}
