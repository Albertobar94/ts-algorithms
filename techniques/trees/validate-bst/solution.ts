/**
 * ============================================================================
 *  THE TRICK: a node is a valid BST node only inside its inherited (low, high)
 * ============================================================================
 *
 *  Checking node.left < node < node.right is WRONG — a node deep in the left
 *  subtree could still exceed a far-up ancestor. Validity is the interval every
 *  ancestor permits. Pass (low, high) down: it starts unbounded, going LEFT drops
 *  the ceiling to node.val, going RIGHT raises the floor to node.val. O(n).
 *
 *  Two angles on the SAME property:
 *    A) Bounds DFS — each node must fit (low, high)        (LeetCode #98)
 *    B) In-order   — a valid BST's in-order is STRICTLY increasing
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
 *  A) VALIDATE BST — BOUNDS DFS  (LeetCode #98)
 * ----------------------------------------------------------------------------
 *  Examples (level-order, null = missing):
 *    [2,1,3]                 -> true
 *    [5,1,4,null,null,3,6]   -> false  (3 and 6 are under 5's right but 3 < 5)
 *    [5,1,7,null,null,4,8]   -> false  (4 is in 5's right subtree but 4 < 5)
 *    [1]                     -> true
 *
 *  Uses `null` bounds for "no limit" (safer than ±Infinity if values are extreme).
 *  Strict inequality → duplicates make it invalid (the standard #98 rule).
 *
 *  Complexity: O(n) time, O(height) stack.
 */
export function isValidBST(
  node: TreeNode | null,
  low: number | null = null,
  high: number | null = null,
): boolean {
  if (node === null) {
    return true; // empty subtree is valid
  }
  // Check against INHERITED bounds (not just the parent). Strict <.
  if ((low !== null && node.val <= low) || (high !== null && node.val >= high)) {
    return false;
  }
  return (
    isValidBST(node.left, low, node.val) && // left: ceiling drops to node.val
    isValidBST(node.right, node.val, high) // right: floor rises to node.val
  );
}

/**
 * ----------------------------------------------------------------------------
 *  B) VALIDATE BST — IN-ORDER  (the twin: in-order must strictly increase)
 * ----------------------------------------------------------------------------
 *  Walk left, node, right; remember the previous value; fail if the next isn't
 *  strictly greater. Same O(n), different lens — and a neat reuse of "in-order of
 *  a BST is sorted."
 */
export function isValidBSTInorder(root: TreeNode | null): boolean {
  let prev: number | null = null;
  let ok = true;

  const inorder = (node: TreeNode | null): void => {
    if (node === null || !ok) {
      return;
    }
    inorder(node.left);
    if (prev !== null && node.val <= prev) {
      ok = false; // not strictly increasing → invalid
    }
    prev = node.val;
    inorder(node.right);
  };

  inorder(root);
  return ok;
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

  const cases: { arr: (number | null)[]; valid: boolean; note: string }[] = [
    { arr: [2, 1, 3], valid: true, note: "simple valid" },
    { arr: [5, 1, 4, null, null, 3, 6], valid: false, note: "right child too small" },
    { arr: [5, 1, 7, null, null, 4, 8], valid: false, note: "ancestor violation (bounds catch it)" },
    { arr: [1], valid: true, note: "single" },
    { arr: [], valid: true, note: "empty" },
    { arr: [10, 5, 15, null, null, 6, 20], valid: false, note: "6 < 10 but in right subtree" },
    { arr: [3, 1, 5, 0, 2, 4, 6], valid: true, note: "full valid" },
    { arr: [2, 2, 2], valid: false, note: "duplicates → strict < fails" },
  ];

  for (const { arr, valid, note } of cases) {
    const tree = build(arr);
    ck(`bounds: ${note}`, isValidBST(tree) === valid);
    ck(`inorder: ${note}`, isValidBSTInorder(tree) === valid);
  }

  console.log(fail === 0 ? "techniques/trees/validate-bst: all checks passed" : `${fail} FAILED`);
}
