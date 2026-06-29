/**
 * ============================================================================
 *  THE TRICK: BFS level-order — a queue frontier, snapshot the level size
 * ============================================================================
 *
 *  Breadth-first: finish depth 0, then 1, then 2... A FIFO queue holds the
 *  frontier. The key move: at the start of each round the queue holds exactly
 *  one level — SNAPSHOT its length, pop that many (collecting values), and push
 *  their children for the next round. O(n) time, O(width) space.
 *
 *  Two problems on the SAME BFS skeleton:
 *    A) Level Order        — list of per-level lists       (LeetCode #102)
 *    B) Zigzag Level Order — flip every other level          (LeetCode #103)
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
 *  A) BINARY TREE LEVEL ORDER TRAVERSAL  (LeetCode #102)
 * ----------------------------------------------------------------------------
 *  Examples (level-order in, null = missing):
 *    [3,9,20,null,null,15,7] -> [[3],[9,20],[15,7]]
 *    []                      -> []
 *    [1]                     -> [[1]]
 *
 *  The bug-prone bit: snapshot `levelSize = queue.length` BEFORE the inner loop —
 *  the queue grows as you enqueue children, so reading length inside spills the
 *  next level into this one.
 *
 *  Complexity: O(n) time, O(width) space. (We pop via an index pointer to keep it
 *  O(1) per dequeue instead of Array.shift's O(n).)
 */
export function levelOrder(root: TreeNode | null): number[][] {
  if (root === null) {
    return [];
  }
  const result: number[][] = [];
  let queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const levelSize = queue.length; // snapshot: exactly this level
    const level: number[] = [];
    const next: TreeNode[] = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue[i];
      level.push(node.val);
      if (node.left !== null) {
        next.push(node.left);
      }
      if (node.right !== null) {
        next.push(node.right);
      }
    }
    result.push(level);
    queue = next; // swap in the next frontier
  }
  return result;
}

/**
 * ----------------------------------------------------------------------------
 *  B) ZIGZAG LEVEL ORDER  (LeetCode #103 — the twin)
 * ----------------------------------------------------------------------------
 *  Same BFS, but left-to-right on even levels and right-to-left on odd ones.
 *
 *  Example:
 *    [3,9,20,null,null,15,7] -> [[3],[20,9],[15,7]]
 *
 *  Cleanest: collect each level left-to-right exactly as #102, then reverse the
 *  list when the level index is odd. (Don't reverse the traversal itself.)
 */
export function zigzagLevelOrder(root: TreeNode | null): number[][] {
  const levels = levelOrder(root);
  for (let i = 0; i < levels.length; i++) {
    if (i % 2 === 1) {
      levels[i].reverse();
    }
  }
  return levels;
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

  const t = build([3, 9, 20, null, null, 15, 7]);
  ck("levelOrder example", eq(levelOrder(t), [[3], [9, 20], [15, 7]]));
  ck("levelOrder empty -> []", eq(levelOrder(build([])), []));
  ck("levelOrder single", eq(levelOrder(build([1])), [[1]]));
  ck("levelOrder skewed", eq(levelOrder(build([1, null, 2, null, 3])), [[1], [2], [3]]));

  ck("zigzag example", eq(zigzagLevelOrder(t), [[3], [20, 9], [15, 7]]));
  ck(
    "zigzag 4 levels",
    eq(zigzagLevelOrder(build([1, 2, 3, 4, 5, 6, 7])), [[1], [3, 2], [4, 5, 6, 7]]),
  );

  console.log(fail === 0 ? "techniques/trees/level-order: all checks passed" : `${fail} FAILED`);
}
