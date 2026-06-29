/**
 * ============================================================================
 *  THE TRICK: two walls from both ends — area capped by the SHORTER wall
 * ============================================================================
 *
 *  Two markers are walls holding water. The rectangle is as wide as the gap and
 *  only as tall as the SHORTER wall (water spills over the lower side):
 *      area = (right - left) * min(height[left], height[right])
 *  Each step move the SHORTER wall inward — moving the taller keeps the same cap
 *  with less width, so it can never improve. One converging sweep, O(1) space.
 *
 *  A) Container With Most Water — most water between two lines   (LeetCode #11)
 *
 * ----------------------------------------------------------------------------
 *  A) CONTAINER WITH MOST WATER  (LeetCode #11)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    `heights[i]` is the height of a vertical line at position i. Pick two lines
 *    that, with the x-axis, hold the MOST water. Return that area.
 *
 *  Examples:
 *    [1,8,6,2,5,4,8,3,7]  -> 49   (lines at index 1 and 8: width 7 * min(8,7))
 *    [1,1]                -> 1
 *    [4,3,2,1,4]          -> 16
 *
 *  Why move the shorter wall (the subtle bit):
 *    The current pair is bounded by the shorter wall. Any pair that keeps the
 *    shorter wall is NARROWER (we're converging) and still capped by that same
 *    short height — so it cannot beat what we just recorded. The only move that
 *    might find a taller cap is replacing the short wall. Dropping it discards
 *    nothing that could win.
 *
 *  Complexity:
 *    Time  O(n) — left and right together cross the array once.
 *    Space O(1).
 */
export function maxArea(heights: number[]): number {
  let left = 0;
  let right = heights.length - 1;
  let best = 0;

  while (left < right) {
    const height = Math.min(heights[left], heights[right]); // shorter wall caps it
    const width = right - left; // index gap, not a bar count
    best = Math.max(best, width * height);

    if (heights[left] < heights[right]) {
      left++; // move the shorter wall
    } else {
      right--; // shorter or tie — moving either is safe
    }
  }

  return best;
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

  ck("maxArea classic -> 49", maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]) === 49);
  ck("maxArea two bars -> 1", maxArea([1, 1]) === 1);
  ck("maxArea tie ends -> 16", maxArea([4, 3, 2, 1, 4]) === 16);
  ck("maxArea single bar -> 0", maxArea([5]) === 0);
  ck("maxArea empty -> 0", maxArea([]) === 0);
  ck("maxArea increasing -> 2", maxArea([1, 2, 3]) === 2); // (i0,i2): 2*min(1,3)=2 ; (i1,i2): 1*min(2,3)=2

  console.log(
    fail === 0 ? "techniques/two-pointers/opposite-ends/max-area: all checks passed" : `${fail} FAILED`,
  );
}
