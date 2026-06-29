/**
 * ============================================================================
 *  THE TRICK: two markers from both ends of a SORTED list, find a pair sum
 * ============================================================================
 *
 *  Put one pointer at the small end, one at the big end. Add them. Too big ->
 *  the largest number can't help, drop `right`. Too small -> drop `left`. Each
 *  move discards a whole batch of impossible pairs, so one sweep is exhaustive.
 *  Works ONLY because the array is sorted. One pass, no extra memory.
 *
 *  Two problems that share the SAME both-ends sweep live here:
 *    A) Two Sum II (sorted)  — exact pair that sums to a target   (LeetCode #167)
 *    B) 3Sum Closest         — triple whose sum is NEAREST target (LeetCode #16)
 *
 * ----------------------------------------------------------------------------
 *  A) TWO SUM II — INPUT ARRAY IS SORTED  (LeetCode #167)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    `numbers` is sorted in NON-DECREASING order. Return the 1-BASED indices of
 *    the two numbers that add up to `target`. Exactly one solution exists, and
 *    you may not use the same element twice.
 *
 *  Examples:
 *    numbers = [2,7,11,15], target = 9   -> [1,2]   (2 + 7)
 *    numbers = [2,3,4],     target = 6   -> [1,3]   (2 + 4)
 *    numbers = [-1,0],      target = -1  -> [1,2]   (-1 + 0)
 *
 *  Approach — converge from both ends:
 *    sum = numbers[left] + numbers[right]
 *      sum === target -> found
 *      sum  <  target -> need a bigger total -> left++  (next larger number)
 *      sum  >  target -> need a smaller total -> right-- (next smaller number)
 *
 *  Why it cannot miss a pair (the subtle bit):
 *    Sorted order means moving `left` right only RAISES the sum, moving `right`
 *    left only LOWERS it. If the sum is too big, then numbers[right] paired with
 *    anything still to its left is also too big — so discarding `right` throws
 *    away only impossible candidates. Each step eliminates a whole batch.
 *
 *  Why this beats the hashmap here:
 *    The array is already sorted, so we get O(1) extra space instead of O(n).
 *    (On an UNSORTED array you'd reach for the hashmap "Two Sum" instead — same
 *    question, different trick, because the input changed. That contrast is the
 *    whole point.)
 *
 *  Complexity:
 *    Time  O(n) — left and right together move at most n steps.
 *    Space O(1) — just two indices.
 */
export function twoSumSorted(numbers: number[], target: number): [number, number] {
  let left = 0;
  let right = numbers.length - 1;

  while (left < right) {
    const sum = numbers[left] + numbers[right];

    if (sum === target) {
      // +1 because the problem wants 1-based indices.
      return [left + 1, right + 1];
    }

    if (sum < target) {
      left++;
    } else {
      right--;
    }
  }

  // Guaranteed to exist by the problem; throw keeps the return type honest.
  throw new Error("No two numbers add up to the target.");
}

/**
 * ----------------------------------------------------------------------------
 *  B) 3SUM CLOSEST  (LeetCode #16 — the far-apart twin)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    Given an integer array `nums` and a `target`, return the sum of the three
 *    integers whose total is CLOSEST to `target`. Exactly one such sum exists.
 *
 *  Examples:
 *    nums = [-1,2,1,-4], target = 1  -> 2   (-1 + 2 + 1)
 *    nums = [0,0,0],     target = 1  -> 0
 *
 *  Same both-ends sweep, wrapped in one extra loop:
 *    Sort first. Fix each index `i`, then run the pair-sum sweep on the rest:
 *    too small -> left++, too big -> right--. But instead of needing an EXACT
 *    hit, we keep the running sum nearest to target. The sort is what lets the
 *    "move one end" decision be trustworthy — identical mechanic to Two Sum II.
 *
 *  Complexity:
 *    Time  O(n^2) — one outer fix, an O(n) sweep inside.  Space O(1) (in place).
 */
export function threeSumClosest(nums: number[], target: number): number {
  const sorted = [...nums].sort((a, b) => a - b); // copy so we don't mutate the caller's array
  let closest = sorted[0] + sorted[1] + sorted[2];

  for (let i = 0; i < sorted.length - 2; i++) {
    let left = i + 1;
    let right = sorted.length - 1;

    while (left < right) {
      const sum = sorted[i] + sorted[left] + sorted[right];

      if (Math.abs(sum - target) < Math.abs(closest - target)) {
        closest = sum;
      }

      if (sum === target) {
        return sum; // can't get closer than exact
      }
      if (sum < target) {
        left++;
      } else {
        right--;
      }
    }
  }

  return closest;
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

  ck("twoSumSorted example 1 -> [1,2]", eq(twoSumSorted([2, 7, 11, 15], 9), [1, 2]));
  ck("twoSumSorted example 2 -> [1,3]", eq(twoSumSorted([2, 3, 4], 6), [1, 3]));
  ck("twoSumSorted negatives -> [1,2]", eq(twoSumSorted([-1, 0], -1), [1, 2]));

  ck("threeSumClosest example 1 -> 2", threeSumClosest([-1, 2, 1, -4], 1) === 2);
  ck("threeSumClosest all zeros -> 0", threeSumClosest([0, 0, 0], 1) === 0);
  ck("threeSumClosest exact hit -> 3", threeSumClosest([0, 1, 2], 3) === 3);

  console.log(
    fail === 0 ? "techniques/two-pointers/opposite-ends/pair-sum: all checks passed" : `${fail} FAILED`,
  );
}
