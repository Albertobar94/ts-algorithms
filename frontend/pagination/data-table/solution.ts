/**
 * ============================================================================
 *  THE TRICK: pagination — slice a list into fixed-size pages, clamp the page,
 *             show "page X of Y"
 * ============================================================================
 *
 *  You have a long list and a page size. Pagination is three small bits of
 *  arithmetic that ALWAYS go together:
 *    1. how many pages exist        -> ceil(total / perPage)
 *    2. which page are we actually on (after clamping to a real page)
 *    3. which slice of the list does that page show
 *
 *  Worked example — 36 users, 10 per page:
 *    pages   = ceil(36 / 10) = 4          (NOT 3 — the last 6 still need a page)
 *    page 1  -> items[0..10)   (ids 1..10)
 *    page 4  -> items[30..40)  -> only 6 rows survive (ids 31..36)
 *
 *  The 4 things to lock in:
 *    1. ceil, not floor, for the page count -> floor drops the final partial page.
 *    2. pages is at LEAST 1                  -> an empty list is still "page 1 of 1",
 *       never "page 1 of 0".
 *    3. clamp the page to [1, pages]         -> Prev past 1 or Next past the end must
 *       not produce a negative start index or an empty page.
 *    4. start = (page - 1) * perPage         -> pages are 1-based, array indexes are
 *       0-based; that "- 1" is where every off-by-one lives.
 *
 *  The sneaky one: when perPage CHANGES (user picks "20 per page" while sitting on
 *  page 4 of a 5-per-page view), the current page may now be past the end. Re-clamp
 *  on every read so the view self-corrects instead of going blank.
 *
 *  Two uses that look unrelated but are the SAME pagination:
 *    A) Data Table UI      — slice rows for the current page (GFE 75, frontend)
 *    B) SQL OFFSET/LIMIT    — page an API/DB query (backend) — identical arithmetic
 *
 * ----------------------------------------------------------------------------
 *  A) DATA TABLE  (GreatFrontEnd "Data Table" — the canonical UI problem)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    Given a list of items, a 1-based page number, and a page size, return the
 *    rows for that page plus everything the UI needs to render controls:
 *    the clamped page, the page size, the total page count, and the total rows.
 *
 *  Why clamp INSIDE paginate (the subtle bit):
 *    Callers (a Prev/Next button, a "rows per page" dropdown) can hand us a page
 *    that's out of range. Clamping at the slice keeps the single source of truth
 *    here, so no caller can ever slice off the end of the list.
 *
 *  Complexity:
 *    Time  O(k) for the returned slice of k rows (the page-count/clamp math is O(1)).
 *    Space O(k) — a new array for the page; the rest is a few numbers.
 */

/** Everything a paginated view needs to render one page + its controls. */
export interface PageView<T> {
  items: T[];
  page: number; // the page actually shown (after clamping) — 1-based
  perPage: number;
  totalPages: number;
  totalItems: number;
}

/**
 * How many pages a list of `totalItems` needs at `perPage` rows each.
 * ceil so a partial last page still counts; floored at 1 so empty lists read
 * "page 1 of 1"; a non-positive perPage is treated as "one page holds everything".
 */
export function totalPages(totalItems: number, perPage: number): number {
  if (perPage <= 0) {
    return 1; // guard: perPage 0 would divide to Infinity
  }
  return Math.max(1, Math.ceil(totalItems / perPage));
}

/** Pin `page` into the real range [1, pages] — clamp BOTH ends. */
export function clampPage(page: number, pages: number): number {
  return Math.min(Math.max(page, 1), pages);
}

/**
 * Slice `items` down to the rows on `page` (1-based) and report the view state.
 * Re-clamps `page` first, so an out-of-range page (Prev past 1, Next past the end,
 * or a stale page after perPage shrank) lands on a real page instead of going blank.
 */
export function paginate<T>(
  items: readonly T[],
  page: number,
  perPage: number,
): PageView<T> {
  const totalItems = items.length;
  const pages = totalPages(totalItems, perPage);
  const safePage = clampPage(page, pages);
  // 1-based page -> 0-based index. The "- 1" is the off-by-one to guard.
  const start = (safePage - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    page: safePage,
    perPage,
    totalPages: pages,
    totalItems,
  };
}

/**
 * ----------------------------------------------------------------------------
 *  B) SQL OFFSET/LIMIT  (the far-apart twin — backend, no UI at all)
 * ----------------------------------------------------------------------------
 *  Problem:
 *    Turn a page number + page size into the OFFSET/LIMIT a database query (or a
 *    REST `?page=&perPage=` endpoint) needs. Same `(page - 1) * perPage` start, just
 *    handed to SQL instead of `Array.slice`.
 *
 *      SELECT * FROM users ORDER BY id LIMIT :limit OFFSET :offset
 *
 *  Clamp the page the same way (a caller can always pass `?page=-3`); we don't know
 *  the row count here, so the page-count clamp happens wherever the total is known.
 */
export interface OffsetLimit {
  offset: number;
  limit: number;
}

export function toOffsetLimit(page: number, perPage: number): OffsetLimit {
  const safePage = Math.max(page, 1); // no upper bound without a row count
  return {
    offset: (safePage - 1) * perPage,
    limit: perPage,
  };
}

// ---------------------------------------------------------------------------
// Quick self-check — run with:  npx tsx solution.ts
// (Fail-counting ck(): prints only failures, then a one-line summary.)
// ---------------------------------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  let fail = 0;
  const ck = (name: string, cond: boolean): void => {
    if (!cond) {
      fail++;
      console.log("FAIL:", name);
    }
  };

  const ids = (view: PageView<number>): number[] => view.items;
  const nums = Array.from({ length: 36 }, (_, i) => i + 1); // 1..36

  // Page count rounds UP (the partial last page counts).
  ck("36 @10 -> 4 pages", totalPages(36, 10) === 4);
  ck("36 @5  -> 8 pages", totalPages(36, 5) === 8);
  ck("36 @20 -> 2 pages", totalPages(36, 20) === 2);
  ck("exact: 40 @10 -> 4 pages", totalPages(40, 10) === 4);
  ck("empty list -> 1 page", totalPages(0, 10) === 1);
  ck("perPage 0 guarded -> 1 page", totalPages(36, 0) === 1);

  // Clamp pins to [1, pages] at both ends.
  ck("clamp below -> 1", clampPage(0, 4) === 1);
  ck("clamp negative -> 1", clampPage(-7, 4) === 1);
  ck("clamp above -> last", clampPage(99, 4) === 4);
  ck("clamp in range -> same", clampPage(3, 4) === 3);

  // Slice boundaries: first page, a middle page, the partial last page.
  ck("page 1 @10 -> ids 1..10", ids(paginate(nums, 1, 10)).join() === "1,2,3,4,5,6,7,8,9,10");
  ck("page 2 @10 -> ids 11..20", ids(paginate(nums, 2, 10)).join() === "11,12,13,14,15,16,17,18,19,20");
  ck("page 4 @10 -> partial 31..36 (6 rows)", ids(paginate(nums, 4, 10)).join() === "31,32,33,34,35,36");

  // Out-of-range page self-corrects via the internal clamp.
  ck("page 99 @10 lands on last page", paginate(nums, 99, 10).page === 4);
  ck("page 0 @10 lands on page 1", paginate(nums, 0, 10).page === 1);

  // The perPage-change trap: on page 4 @5, switch to @20 -> only 2 pages exist,
  // so the view must re-clamp to page 2, not blank out on page 4.
  const reclamped = paginate(nums, 4, 20);
  ck("perPage shrink re-clamps page", reclamped.page === 2);
  ck("perPage shrink shows real rows", ids(reclamped).join() === "21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36");

  // Empty list: one page, no rows, no crash.
  const empty = paginate([] as number[], 1, 10);
  ck("empty: 1 page", empty.totalPages === 1);
  ck("empty: 0 rows", empty.items.length === 0);

  // Twin: OFFSET/LIMIT uses the same (page-1)*perPage start.
  ck("offset page 1 -> 0", toOffsetLimit(1, 10).offset === 0);
  ck("offset page 3 -> 20", toOffsetLimit(3, 10).offset === 20);
  ck("limit echoes perPage", toOffsetLimit(3, 10).limit === 10);
  ck("offset clamps page<1 -> 0", toOffsetLimit(-2, 10).offset === 0);

  console.log(
    fail === 0
      ? "frontend/pagination/data-table: all checks passed"
      : `${fail} FAILED`,
  );
}
