/**
 * ============================================================================
 *  THE TRICK: a tree's depth is 1 + the deeper child (DFS recursion)
 * ============================================================================
 *
 *  depth(node) = 0 if node is null, else 1 + max(depth(left), depth(right)).
 *  Textbook recursion — a tree is made of subtrees, so solve each child the same
 *  way and fold with "1 + max". O(n) time, O(height) stack.
 *
 *  Two problems, same shape — the second hides a trap:
 *    A) Maximum Depth — 1 + max(...)                 (LeetCode #104)
 *    B) Minimum Depth — 1 + min, BUT a one-child node (LeetCode #111)
 *       must take the present child, not min(child, 0).
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
 *  A) MAXIMUM DEPTH OF BINARY TREE  (LeetCode #104)
 * ----------------------------------------------------------------------------
 *  Number of nodes on the longest root-to-leaf path.
 *
 *  Examples (level-order, null = missing):
 *    [3,9,20,null,null,15,7] -> 3
 *    []                      -> 0
 *    [1,null,2]              -> 2
 *
 *  Complexity: O(n) time, O(height) stack.
 */
export function maxDepth(node: TreeNode | null): number {
  if (node === null) {
    return 0; // empty subtree contributes 0
  }
  return 1 + Math.max(maxDepth(node.left), maxDepth(node.right));
}

/**
 * ----------------------------------------------------------------------------
 *  B) MINIMUM DEPTH OF BINARY TREE  (LeetCode #111 — the trap twin)
 * ----------------------------------------------------------------------------
 *  Shortest path from root to a LEAF (a node with no children).
 *
 *  Examples:
 *    [3,9,20,null,null,15,7] -> 2
 *    [2,null,3,null,4]       -> 3   (single chain — NOT 1; the one-child node isn't a leaf)
 *
 *  The trap: `1 + min(left, right)` is WRONG when one child is null — it would
 *  return 1 for a node that only has a right subtree, but that node is not a leaf.
 *  When a child is missing, you MUST descend into the present one.
 *
 *  Complexity: O(n) time, O(height) stack.
 */
export function minDepth(node: TreeNode | null): number {
  if (node === null) {
    return 0;
  }
  // Leaf → depth 1.
  if (node.left === null && node.right === null) {
    return 1;
  }
  // Exactly one child missing → must go down the present child only.
  if (node.left === null) {
    return 1 + minDepth(node.right);
  }
  if (node.right === null) {
    return 1 + minDepth(node.left);
  }
  // Both children present → the shallower one wins.
  return 1 + Math.min(minDepth(node.left), minDepth(node.right));
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

  ck("maxDepth example -> 3", maxDepth(build([3, 9, 20, null, null, 15, 7])) === 3);
  ck("maxDepth empty -> 0", maxDepth(build([])) === 0);
  ck("maxDepth skewed -> 2", maxDepth(build([1, null, 2])) === 2);
  ck("maxDepth single -> 1", maxDepth(build([5])) === 1);

  ck("minDepth example -> 2", minDepth(build([3, 9, 20, null, null, 15, 7])) === 2);
  ck("minDepth single chain -> 3", minDepth(build([2, null, 3, null, 4])) === 3);
  ck("minDepth empty -> 0", minDepth(build([])) === 0);
  ck("minDepth single -> 1", minDepth(build([5])) === 1);

  console.log(fail === 0 ? "techniques/trees/max-depth: all checks passed" : `${fail} FAILED`);
}
