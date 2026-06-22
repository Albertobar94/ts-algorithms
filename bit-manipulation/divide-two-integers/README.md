# Divide by doubling

## 1. What it is
Dividing `dividend ÷ divisor` is really one question: **how many times does the
divisor fit inside the dividend?** Here you must answer it using only `+`, `−`, and
comparisons — no `*`, `/`, or `%`.

The slow way: subtract the divisor over and over and count. For `43 ÷ 3` that's
3, 6, 9, … one step at a time — up to billions of steps for big numbers.

The trick: count in **doubling jumps** instead of one at a time. Start with one
divisor, then keep doubling it — 1 divisor, then 2, then 4, then 8, … (each jump is
just the previous one added to itself). Every round, take the **biggest jump that
still fits** in what's left, subtract it, write down how many divisors that jump was
worth, then repeat on the leftover.

`43 ÷ 3`, round by round:
- `24` (that's 8 threes) fits in 43 → leftover `19`
- `12` (4 threes) fits in 19 → leftover `7`
- `6` (2 threes) fits in 7 → leftover `1`
- `1` is smaller than 3 → stop. Answer = `8 + 4 + 2 = 14`.

> Built on: **Bit Manipulation** (doubling a number = `×2`). The one idea: don't
> subtract the divisor one at a time — subtract it in big doubling jumps (1×, 2×, 4×,
> 8× the divisor, always the biggest that fits) and add up how many divisors each jump
> was worth. Those counts add up to the answer.

## 2. Spot it
**In a problem:**
- "divide / multiply / pow **without** `*`, `/`, `%`" → you must build the result from `+` and `-`.
- a count/quotient that could be **huge** (~2³¹), so "loop one step at a time" is too slow → use **doubling** (grow the step `×2` each round) to finish in far fewer steps.
- "32-bit signed range", "clamp the result", "truncate toward zero" → overflow is a deliberate trap.

**In real code** (reviewing a PR — any stack):
- Frontend / general: a loop that **doubles a step or size each iteration until it passes a target** — buffer/array growth, retry backoff intervals, "round up to the next power of two" sizing. (Plain `x << 1` as a fast `×2` is *not* this trick — that's just a bit op; see §8.)
- Backend: **exponential (galloping) search** — doubling a probe index until it overshoots, then binary-searching the bracket (finding a bound in an unbounded or paginated sorted source); fixed-point math on hardware with no integer divide.
- Smell test: a loop that adds or subtracts a **fixed amount N times where N can be billions** → replace it with doubling. O(N) → O(log N).

## 3. What you track
- `a` — what's left to divide (works on the absolute value).
- `b` — the divisor (absolute value).
- `temp` — the current chunk (`b` doubled some number of times).
- `multiple` — what that chunk is worth (`2^k`).
- `result` — the quotient being summed up.
- `sign` — computed once from the two inputs.

## 4. How it works
Recipe:
> 1. Clamp the one overflow case (`INT_MIN / -1`), work out the sign, take absolute values.
> 2. While `a >= b`:
>    a. Start a chunk: `temp = b`, worth `multiple = 1`.
>    b. While doubling the chunk still fits (`a >= temp + temp`): double both `temp` and `multiple`.
>    c. Subtract the biggest chunk (`a -= temp`) and bank its worth (`result += multiple`).
> 3. Apply the sign.

**Why doubling makes it fast (the part to slow down for):** after the inner loop,
`temp` is the largest `b × 2^k` that's `≤ a`. Each chunk is found in ~log steps, and
there are ~log chunks → about `O(log² n)` (roughly "number of doublings, squared").
That's **not** O(1): it only stays small because the **input is capped at 32 bits**, so
the number of doublings is ≤ ~32 and the whole thing is ≤ ~32×32 ≈ 1024 steps. Compare
~2 billion for one-at-a-time subtraction.

**⚠️ The 32-bit shift trap (this is bit-manipulation, so it bites here):** in
JavaScript `<<` coerces to a **32-bit signed** int. Once `temp` reaches `2³⁰`,
`temp << 1` leaves the signed range, and two more shifts drive `temp` to **0**
(`2³⁰ → −2³¹ → 0`). From then on `0 << 1` stays `0`, so `a >= (temp << 1)` is true
forever and the loop **never exits**. Double with **addition** (`temp += temp`) instead
— JS numbers are 64-bit floats, safe past `2³¹`. See [`solution.ts`](./solution.ts) for
the buggy vs fixed versions side by side.

## 5. Picture
```mermaid
flowchart TD
    A[clamp INT_MIN/-1, find sign, a=|dividend|, b=|divisor|] --> B{a >= b?}
    B -- no --> Z[return sign * result]
    B -- yes --> C[temp = b, multiple = 1]
    C --> D{a >= temp + temp?}
    D -- yes --> E[temp += temp; multiple += multiple]
    E --> D
    D -- no --> F[a -= temp; result += multiple]
    F --> B
```

## 6. Two disguises
Same "double your step until it would overshoot, then commit it" mechanic.

- **A — LeetCode #29 Divide Two Integers** (math): divide without `*`, `/`, `%`,
  truncate toward zero, clamp to 32-bit. Mapping: the inner loop doubles `b` to find
  the biggest `b × 2^k ≤ a`, subtracts it, and adds `2^k` to the quotient.
- **B — Exponential ("galloping") search** (backend / data access): _galloping_ just
  means "take bigger and bigger jumps." Find the first position in a **huge or
  unbounded** sorted source (a paginated API, a giant file) whose value is `≥ target`,
  without scanning linearly. Mapping: **double the probe index** (`bound += bound`)
  until `source[bound]` overshoots the target, then binary search the bracket
  `[bound/2, bound]`. The doubling loop is *literally the same move* as `divide`'s
  inner loop — different domain (searching), identical trick. (That second half is the
  **binary-search** trick — a sibling pattern; see
  [`../../binary-search/find-target`](../../binary-search/find-target/README.md).
  Exponential search = this note's doubling **+** binary search, composed.)

## 7. Questions to ask
Only the trick-specific ones (generic scoping lives in the repo README):
- "What's the clamp range, and which exact value overflows?" (`INT_MIN / -1`.)
- "Truncate toward zero, or floor?" (changes sign handling for negatives.)
- "Can the divisor be 0?" (#29 says no — but ask.)
- "Is this language's `<<` fixed-width?" (JS = 32-bit → the trap above; reach for `+` doubling.)

## 8. Go faster
- Skeleton you keep ready:
  ```ts
  let temp = b, multiple = 1;
  while (a >= temp + temp) { temp += temp; multiple += multiple; }
  a -= temp; result += multiple;
  ```
- Invariant: after the inner loop, `temp` is the **largest `b × 2^k` that is `≤ a`**.
- Trick-specific bugs: JS `<<` 32-bit overflow (use `+`); the `INT_MIN / -1` clamp;
  the sign when exactly one input is negative.
- Say the cost out loud first: **"O(log² n) time — ≤ ~32×32 steps here only because inputs are 32-bit; O(1) space."**

---

Solution code (both disguises, fully commented, plus the buggy `<<` version): [`solution.ts`](./solution.ts).
