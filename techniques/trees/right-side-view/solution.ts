/**
 * ============================================================================
 *  THE TRICK: right side view = the LAST node of every level (BFS)
 * ============================================================================
 *
 *  Looking from the right, at each depth you see the rightmost node — which may
 *  be reached through a LEFT branch if the right side is shorter. So you can't
 *  just follow right pointers. Run a level-order sweep and keep the last node of
 *  each level (enqueue left then right so "last" is truly rightmost). O(n).
 *
 *  Two problems, mirror images:
 *    A) Right Side View — last node per level   (LeetCode #199)
 *    B) Left Side View  — first node per level   (the mirror)
 *
 *  Node shape (each note is self-contained, so we declare it locally):
 */
class TreeNode {
  val: number;
  left: TreeNode | null = null;
  right: TreeNode | null = null;
  constructor(val: number) {
    this.val = val;
  }
}

/**
 * ----------------------------------------------------------------------------
 *  A) BINARY TREE RIGHT SIDE VIEW  (LeetCode #199)
 * ----------------------------------------------------------------------------
 *  Examples:
 *    [1,2,3,null,5,null,4] -> [1,3,4]
 *    [1,null,3]            -> [1,3]
 *    []                    -> []
 *    [1,2,3,4]             -> [1,3,4]   (4 is a LEFT-branch node, rightmost at depth 2)
 *
 *  Complexity: O(n) time, O(width) space.
 */
export function rightSideView(root: TreeNode | null): number[] {
  return sideView(root, /* fromRight */ true);
}

/** Left side view — the mirror: first node of each level. */
export function leftSideView(root: TreeNode | null): number[] {
  return sideView(root, /* fromRight */ false);
}

function sideView(root: TreeNode | null, fromRight: boolean): number[] {
  if (root === null) {
    return [];
  }
  const view: number[] = [];
  let queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;
    const next: TreeNode[] = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue[i];
      // Right view keeps the last node (index levelSize-1); left view keeps the first (index 0).
      const boundary = fromRight ? levelSize - 1 : 0;
      if (i === boundary) {
        view.push(node.val);
      }
      if (node.left !== null) {
        next.push(node.left);
      }
      if (node.right !== null) {
        next.push(node.right);
      }
    }
    queue = next;
  }
  return view;
}

// --- self-check helper: build a tree from a LeetCode level-order array ---
function build(arr: (number | null)[]): TreeNode | null {
  if (arr.length === 0 || arr[0] === null) {
    return null;
  }
  const root = new TreeNode(arr[0]);
  const queue: TreeNode[] = [root];
  let i = 1;
  while (i < arr.length && queue.length > 0) {
    const node = queue.shift() as TreeNode;
    if (i < arr.length) {
      const l = arr[i++];
      if (l !== null) {
        node.left = new TreeNode(l);
        queue.push(node.left);
      }
    }
    if (i < arr.length) {
      const r = arr[i++];
      if (r !== null) {
        node.right = new TreeNode(r);
        queue.push(node.right);
      }
    }
  }
  return root;
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

  ck("right view example", eq(rightSideView(build([1, 2, 3, null, 5, null, 4])), [1, 3, 4]));
  ck("right view skewed", eq(rightSideView(build([1, null, 3])), [1, 3]));
  ck("right view empty", eq(rightSideView(build([])), []));
  ck("right view left-branch rightmost", eq(rightSideView(build([1, 2, 3, 4])), [1, 3, 4]));

  ck("left view example", eq(leftSideView(build([1, 2, 3, null, 5, null, 4])), [1, 2, 5]));
  ck("left view single", eq(leftSideView(build([1])), [1]));

  console.log(fail === 0 ? "techniques/trees/right-side-view: all checks passed" : `${fail} FAILED`);
}
