/**
 * ============================================================================
 *  GreatFrontEnd "Data Table" — paginated user table
 * ============================================================================
 *
 *  The whole UI is a thin shell around the pagination primitive in `solution.ts`.
 *  All the arithmetic that can go wrong (page count, clamping, the slice) lives
 *  there and is unit-checked; this file only wires it to state and markup:
 *
 *    - `page`    — the 1-based page the user is on
 *    - `perPage` — rows per page (5 / 10 / 20)
 *    - `paginate(users, page, perPage)` returns the rows + control state to render
 *
 *  Two bugs this layout deliberately avoids:
 *    1. Prev/Next running off the ends — the buttons are DISABLED at page 1 / last,
 *       and even if they weren't, `paginate` re-clamps.
 *    2. The "rows per page" trap — when you shrink/grow `perPage`, the old page may
 *       be past the new end. We render `view.page` (the clamped page paginate hands
 *       back), so the label and the rows never disagree.
 *
 *  Note: this is the real component for study; it needs a React + JSX toolchain to
 *  run. The page math it relies on is verified by `solution.ts`'s self-check.
 */
import { useState } from "react";
import type { ChangeEvent, JSX } from "react";
import { paginate } from "./solution";
import { users, type User } from "./data";

const PER_PAGE_OPTIONS = [5, 10, 20] as const;

const COLUMNS: ReadonlyArray<{ label: string; key: keyof User }> = [
  { label: "Id", key: "id" },
  { label: "Name", key: "name" },
  { label: "Age", key: "age" },
  { label: "Occupation", key: "occupation" },
];

export default function DataTable(): JSX.Element {
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);

  // Single source of truth for what to render — including the clamped page.
  const view = paginate(users, page, perPage);

  const handlePrev = (): void => {
    setPage((current) => current - 1);
  };

  const handleNext = (): void => {
    setPage((current) => current + 1);
  };

  const handlePerPageChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ): void => {
    setPerPage(Number(event.target.value));
    // Reset to page 1: simplest correct reset. (paginate would re-clamp anyway,
    // but landing on page 1 is the least surprising behavior on a size change.)
    setPage(1);
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            {COLUMNS.map(({ label, key }) => (
              <th key={key}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {view.items.map((user) => (
            <tr key={user.id}>
              {COLUMNS.map(({ key }) => (
                <td key={key}>{user[key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <button type="button" onClick={handlePrev} disabled={view.page <= 1}>
          Prev
        </button>
        <span>
          Page {view.page} of {view.totalPages}
        </span>
        <button
          type="button"
          onClick={handleNext}
          disabled={view.page >= view.totalPages}
        >
          Next
        </button>

        <label>
          Rows per page:{" "}
          <select value={perPage} onChange={handlePerPageChange}>
            {PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
