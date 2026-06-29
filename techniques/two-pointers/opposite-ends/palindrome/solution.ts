/**
 * ============================================================================
 *  THE TRICK: two markers from both ends of a string, compare for a match
 * ============================================================================
 *
 *  Put one pointer at each end. If the end characters match, step BOTH inward
 *  and keep going; if they differ, it's not a palindrome. Works because a string
 *  is symmetric to check — the outer pair must match before any inner pair
 *  matters. One inward sweep, no extra memory.
 *
 *  Two problems on the SAME both-ends-equality skeleton live here:
 *    A) Valid Palindrome      — reads the same both ways            (LeetCode #125)
 *    B) Valid Palindrome II   — same, but ONE deletion is allowed   (LeetCode #680)
 *
 * ----------------------------------------------------------------------------
 *  A) VALID PALINDROME  (LeetCode #125)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    Consider only alphanumeric characters, ignore case. True if it reads the
 *    same forwards and backwards.
 *
 *  Examples:
 *    "A man, a plan, a canal: Panama"  -> true   ("amanaplanacanalpanama")
 *    "race a car"                      -> false
 *    " "                               -> true   (no alphanumerics -> empty -> palindrome)
 *    "0P"                              -> false  ('0' vs 'p' — alnum but unequal)
 *
 *  The decision: compare the two end characters for EQUALITY. Equal -> step BOTH
 *  inward; different -> not a palindrome. Skip characters that don't count
 *  (punctuation, spaces) BEFORE each comparison.
 *
 *  Complexity:
 *    Time  O(n) — each character is visited at most once.
 *    Space O(1) — two indices; no cleaned-up copy of the string is built.
 */
export function isPalindrome(s: string): boolean {
  const isAlphanumeric = (c: string): boolean => /[a-z0-9]/i.test(c);

  let left = 0;
  let right = s.length - 1;

  while (left < right) {
    while (left < right && !isAlphanumeric(s[left])) {
      left++;
    }
    while (left < right && !isAlphanumeric(s[right])) {
      right--;
    }

    if (s[left].toLowerCase() !== s[right].toLowerCase()) {
      return false;
    }

    left++;
    right--;
  }

  return true;
}

/**
 * ----------------------------------------------------------------------------
 *  B) VALID PALINDROME II  (LeetCode #680 — the "almost" twin)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    Lowercase string. Return true if it can become a palindrome by deleting AT
 *    MOST ONE character.
 *
 *  Examples:
 *    "aba"   -> true   (already a palindrome, deletion unused)
 *    "abca"  -> true   (delete 'c' — or 'b' — leaving "aba"/"aca")
 *    "abc"   -> false  (one deletion isn't enough)
 *
 *  Same skeleton, one mercy:
 *    Walk inward while ends match. On the FIRST mismatch, spend the single
 *    deletion — but the bad char could be EITHER end, so test both: is the range
 *    with the left char skipped a palindrome, OR the range with the right char
 *    skipped? Either true -> overall true. Checking only one side is the classic
 *    bug (it wrongly rejects strings a single deletion could save).
 *
 *  Complexity:
 *    Time  O(n) — one inward sweep, plus at most one O(n) range re-check.
 *    Space O(1).
 */
export function validPalindromeII(s: string): boolean {
  // Plain both-ends check over s[i..j] (inclusive) — no deletions left to spend.
  const isRange = (i: number, j: number): boolean => {
    while (i < j) {
      if (s[i] !== s[j]) {
        return false;
      }
      i++;
      j--;
    }
    return true;
  };

  let left = 0;
  let right = s.length - 1;

  while (left < right) {
    if (s[left] !== s[right]) {
      // Spend the one deletion: skip the left char OR the right char.
      return isRange(left + 1, right) || isRange(left, right - 1);
    }
    left++;
    right--;
  }

  return true; // no mismatch — already a palindrome.
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

  ck("palindrome: panama -> true", isPalindrome("A man, a plan, a canal: Panama") === true);
  ck("palindrome: race a car -> false", isPalindrome("race a car") === false);
  ck("palindrome: spaces only -> true", isPalindrome(" ") === true);
  ck("palindrome: 0P -> false (case/alnum edge)", isPalindrome("0P") === false);

  ck("almost: aba -> true (already)", validPalindromeII("aba") === true);
  ck("almost: abca -> true (drop c)", validPalindromeII("abca") === true);
  ck("almost: abc -> false", validPalindromeII("abc") === false);
  ck("almost: deeee -> true (drop d)", validPalindromeII("deeee") === true);
  ck("almost: xbccb -> true (skip-left branch)", validPalindromeII("xbccb") === true);
  ck("almost: bccbx -> true (skip-right branch)", validPalindromeII("bccbx") === true);

  console.log(
    fail === 0
      ? "techniques/two-pointers/opposite-ends/palindrome: all checks passed"
      : `${fail} FAILED`,
  );
}
