/**
 * ============================================================================
 *  THE TRICK: stack the unmatched '(' indices; delete whatever's left over
 * ============================================================================
 *
 *  Scan once. Push the INDEX of each '(' you haven't matched. A ')' either pops
 *  the most recent '(' (matched) or, with nothing open, is an orphan -> mark it.
 *  After the scan, any index still on the stack is a '(' that never closed ->
 *  mark it too. Delete exactly the marked positions: each is forced (an orphan
 *  has no partner anywhere), so the result is minimal. One pass, O(n).
 *
 *  Two problems, same matching — one needs POSITIONS, one needs only a COUNT:
 *    A) Minimum Remove to Make Valid — return a valid string  (LeetCode #1249)
 *    B) Minimum Add to Make Valid    — return just the count   (LeetCode #921)
 *
 * ----------------------------------------------------------------------------
 *  A) MINIMUM REMOVE TO MAKE VALID PARENTHESES  (LeetCode #1249)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    String of '(' , ')' and lowercase letters. Remove the FEWEST parentheses so
 *    the result is valid. Return any such result.
 *
 *  Examples:
 *    "a)b(c)d"     -> "ab(c)d"
 *    "))(("        -> ""
 *    "(a(b(c)d)"   -> "a(b(c)d)"
 *    "lee(t(c)o)de" -> "lee(t(c)o)de"  (already valid)
 *
 *  Why minimal: an orphan ')' has no opener and a leftover '(' has no closer —
 *  each MUST go; matched pairs are never touched.
 *
 *  Complexity:
 *    Time  O(n).  Space O(n) for the stack + remove set.
 */
export function minRemoveToMakeValid(s: string): string {
  const stack: number[] = []; // indices of unmatched '('
  const remove = new Set<number>();

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "(") {
      stack.push(i);
    } else if (ch === ")") {
      if (stack.length > 0) {
        stack.pop(); // matched the most recent '('
      } else {
        remove.add(i); // ')' with nothing open → orphan
      }
    }
    // letters: ignore
  }

  for (const i of stack) {
    remove.add(i); // leftover '(' never closed
  }

  let out = "";
  for (let i = 0; i < s.length; i++) {
    if (!remove.has(i)) {
      out += s[i];
    }
  }
  return out;
}

/**
 * ----------------------------------------------------------------------------
 *  B) MINIMUM ADD TO MAKE PARENTHESES VALID  (LeetCode #921 — the count twin)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    Return the minimum number of '(' or ')' to ADD to make the string valid.
 *
 *  Examples:
 *    "())"  -> 1     "((("  -> 3     "()"  -> 0     ")("  -> 2
 *
 *  Why no stack here:
 *    We never need to know WHICH brackets — only HOW MANY are unmatched. Track
 *    `open` (unclosed '(' so far) and `adds` (')' that found nothing to close).
 *    A stack would just store identical '(' tokens whose count is all we use, so
 *    a counter is the right tool. (Need positions → use the stack version above.)
 *
 *  Complexity:
 *    Time  O(n).  Space O(1).
 */
export function minAddToMakeValid(s: string): number {
  let open = 0; // unmatched '(' so far
  let adds = 0; // ')' that had no '(' to close

  for (const ch of s) {
    if (ch === "(") {
      open++;
    } else if (ch === ")") {
      if (open > 0) {
        open--;
      } else {
        adds++;
      }
    }
  }

  return adds + open; // orphan ')'s + leftover '('s
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

  ck('minRemove "a)b(c)d" -> "ab(c)d"', minRemoveToMakeValid("a)b(c)d") === "ab(c)d");
  ck('minRemove "))((" -> ""', minRemoveToMakeValid("))((") === "");
  ck('minRemove "(a(b(c)d)" -> "a(b(c)d)"', minRemoveToMakeValid("(a(b(c)d)") === "a(b(c)d)");
  ck('minRemove already valid', minRemoveToMakeValid("lee(t(c)o)de") === "lee(t(c)o)de");
  ck('minRemove no brackets', minRemoveToMakeValid("abc") === "abc");

  ck('minAdd "())" -> 1', minAddToMakeValid("())") === 1);
  ck('minAdd "(((" -> 3', minAddToMakeValid("(((") === 3);
  ck('minAdd "()" -> 0', minAddToMakeValid("()") === 0);
  ck('minAdd ")(" -> 2', minAddToMakeValid(")(") === 2);

  console.log(
    fail === 0 ? "techniques/stack/min-remove-brackets: all checks passed" : `${fail} FAILED`,
  );
}
