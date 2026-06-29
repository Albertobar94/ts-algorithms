/**
 * ============================================================================
 *  THE TRICK: count a COMPLETE tree via perfect-subtree shortcut (O(log^2 n))
 * ============================================================================
 *
 *  In a complete tree, for any node compare its left-spine height (go left only)
 *  and right-spine height (go right only). Equal -> the subtree is PERFECT, so it
 *  has exactly 2^h - 1 nodes (no need to walk them). Differ -> the last level is
 *  partial here, so recurse both children + 1. Only O(log n) nodes hit the
 *  recursive branch, each doing an O(log n) spine walk -> O(log^2 n) total.
 *
 *  Two ways, to make the speedup concrete:
 *    A) Count Complete Tree Nodes — the shortcut   (LeetCode #222)
 *    B) Count ANY tree            — plain O(n) walk (the contrast)
 *
 *  JS TRAP: use `2 ** h`, NOT `1 << h` — the bitwise shift is 32-bit and silently
 *  wraps for h >= 31, giving wrong counts on big trees.
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

function leftHeight(node: TreeNode | null): number {
  let h = 0;
  while (node !== null) {
    h++;
    node = node.left;
  }
  return h;
}

function rightHeight(node: TreeNode | null): number {
  let h = 0;
  while (node !== null) {
    h++;
    node = node.right;
  }
  return h;
}

/**
 * ----------------------------------------------------------------------------
 *  A) COUNT COMPLETE TREE NODES  (LeetCode #222)
 * ----------------------------------------------------------------------------
 *  Examples:
 *    [1,2,3,4,5,6]   -> 6
 *    []              -> 0
 *    [1]             -> 1
 *    [1,2,3,4,5,6,7] -> 7   (perfect → 2^3 - 1)
 *
 *  Complexity: O(log^2 n) time, O(log n) stack.
 */
export function countNodes(node: TreeNode | null): number {
  if (node === null) {
    return 0;
  }
  const lh = leftHeight(node);
  const rh = rightHeight(node);
  if (lh === rh) {
    return 2 ** lh - 1; // perfect subtree — NOT (1 << lh): 32-bit trap
  }
  return 1 + countNodes(node.left) + countNodes(node.right);
}

/**
 * ----------------------------------------------------------------------------
 *  B) COUNT ANY TREE  (the O(n) contrast — no completeness assumed)
 * ----------------------------------------------------------------------------
 *  When completeness isn't guaranteed, the shortcut is invalid; just walk all n.
 */
export function countAll(node: TreeNode | null): number {
  if (node === null) {
    return 0;
  }
  return 1 + countAll(node.left) + countAll(node.right);
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

  ck("count [1..6] -> 6", countNodes(build([1, 2, 3, 4, 5, 6])) === 6);
  ck("count empty -> 0", countNodes(build([])) === 0);
  ck("count single -> 1", countNodes(build([1])) === 1);
  ck("count perfect 7 -> 7", countNodes(build([1, 2, 3, 4, 5, 6, 7])) === 7);
  ck("count last-level partial -> 5", countNodes(build([1, 2, 3, 4, 5])) === 5);

  // Shortcut must agree with the brute O(n) count on every complete tree.
  for (let n = 0; n <= 33; n++) {
    const arr = Array.from({ length: n }, (_unused, i) => i + 1);
    const tree = build(arr);
    ck(`shortcut == countAll for n=${n}`, countNodes(tree) === countAll(tree));
    ck(`shortcut == n for n=${n}`, countNodes(tree) === n);
  }

  console.log(
    fail === 0 ? "techniques/trees/count-complete: all checks passed" : `${fail} FAILED`,
  );
}
