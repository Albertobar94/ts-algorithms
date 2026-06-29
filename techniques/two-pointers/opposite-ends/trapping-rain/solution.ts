/**
 * ============================================================================
 *  THE TRICK: two markers from both ends, summing water on top of every bar
 * ============================================================================
 *
 *  Water over bar i rises to min(tallest wall left, tallest wall right) - h[i].
 *  Keep leftMax / rightMax (tallest seen from each end). Each step work the
 *  SHORTER current end: if height[left] < height[right], the right side is
 *  guaranteed tall enough, so the left bar's water is capped by leftMax alone —
 *  commit it and step in. One pass, O(1) space (vs. two prefix-max scans).
 *
 *  A) Trapping Rain Water — total water trapped after rain   (LeetCode #42)
 *
 * ----------------------------------------------------------------------------
 *  A) TRAPPING RAIN WATER  (LeetCode #42)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    `heights[i]` is an elevation map's bar height. Return the total units of
 *    water trapped on top of the bars after it rains.
 *
 *  Examples:
 *    [0,1,0,2,1,0,1,3,2,1,2,1]  -> 6
 *    [4,2,0,3,2,5]              -> 9
 *    [3,0,2]                    -> 2
 *
 *  Why committing the shorter side is safe (the subtle bit):
 *    If height[left] < height[right], there's a wall on the right at least
 *    height[right] > height[left], so rightMax >= height[left]. The water over
 *    the left bar is min(leftMax, rightMax) - height[left], and rightMax is NOT
 *    the limiting one — so it's exactly leftMax - height[left]. We never need the
 *    exact right max to settle a left bar, only that the right has something tall
 *    enough, which the comparison guarantees.
 *
 *  Complexity:
 *    Time  O(n) — left and right cross the array once.
 *    Space O(1) — two maxes and a running total (no prefix arrays).
 */
export function trap(heights: number[]): number {
  let left = 0;
  let right = heights.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let water = 0;

  while (left < right) {
    if (heights[left] < heights[right]) {
      // Left is the shorter extreme → its water is capped by leftMax.
      if (heights[left] >= leftMax) {
        leftMax = heights[left]; // new tallest-left wall: traps 0, raise the cap
      } else {
        water += leftMax - heights[left];
      }
      left++;
    } else {
      if (heights[right] >= rightMax) {
        rightMax = heights[right];
      } else {
        water += rightMax - heights[right];
      }
      right--;
    }
  }

  return water;
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

  ck("trap classic -> 6", trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]) === 6);
  ck("trap valley -> 9", trap([4, 2, 0, 3, 2, 5]) === 9);
  ck("trap small -> 2", trap([3, 0, 2]) === 2);
  ck("trap monotonic up -> 0", trap([1, 2, 3, 4]) === 0);
  ck("trap monotonic down -> 0", trap([4, 3, 2, 1]) === 0);
  ck("trap empty -> 0", trap([]) === 0);
  ck("trap single -> 0", trap([5]) === 0);

  console.log(
    fail === 0 ? "techniques/two-pointers/opposite-ends/trapping-rain: all checks passed" : `${fail} FAILED`,
  );
}
