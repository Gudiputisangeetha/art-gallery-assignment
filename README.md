Selection approach (important)
------------------------------
This app uses a "User Action Tracker" for selection persistence.

- We store **only** per-item user actions by id: { id: 'selected' | 'deselected' }.
- We never keep row objects from multiple pages in memory.
- On each page fetch we compute which rows are selected by checking the tracker.
- This design prevents OOM issues and satisfies the "no global array of rows" rule.

Why this is safe:
- IDs are small, the tracker stores tiny strings per id.
- All page fetches are performed on page navigation (server-side pagination).
