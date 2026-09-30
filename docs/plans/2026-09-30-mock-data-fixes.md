# Mock data and page fixes — 2026-09-30

Branch: `ayt-rfid`. Found by running `npm run dev:mock` and checking each page in the browser.

## Findings

### A. Mock data is wrong

| # | Where | Problem | Seen on |
|---|---|---|---|
| M1 | `frontend/src/mocks/fixtures/lots.ts:22-23` | Part is `n % 4`, WOS is `floor(n / 4)`, so every WOS holds 4 different parts (e.g. W000104 = 6204ZZCM and 6003VVCM). A real WOS has one part. | Dashboard Detail, Clear Tag |
| M2 | `frontend/src/mocks/fixtures/lots.ts:37-38` | Timestamps for today use fixed hours up to 15:30, so some are in the future. | Dashboard Detail |
| M3 | `frontend/src/mocks/fixtures/dailyInventory.ts` | Not linked to `lots`. Daily Inventory total is 7,757, but the cards say 5,450, and the part/WOS pairs differ from the Detail tab. | Dashboard Summary |
| M4 | `frontend/src/mocks/fixtures/lots.ts:43` | Clear Tag history has only 2 rows today, and every remark is `[FROM: MC Gauging F1]`. | Clear Tag History |

### B. Visible in mock mode, but the page or backend is the cause

| # | Where | Problem |
|---|---|---|
| P1 | `frontend/src/pages/Assembly/ClearTag.tsx:328-334` | The selector offers statuses that `/completed` rejects. Only status 3 is accepted, both in the mock and in `Stored_tb_assy_completed.sql:31`. It is not pre-filled from the lot. |
| P2 | `frontend/src/pages/Assembly/ReaderConfig.tsx`, Type `<select>` | The type options are hard-coded to `gr_f1` / `mc_f1`. |
| P3 | `frontend/src/pages/Assembly/ReaderConfig.tsx`, `isConnected` | Connection status is matched by `type`, not `index`, so two readers of the same type show the same status. |
| P4 | `frontend/src/pages/Assembly/ReaderConfig.tsx`, empty-state row | `colSpan={6}`, but the table has 7 columns. |
| P5 | `frontend/src/pages/Assembly/Management/StatusTab.tsx:120`, `:6` | The header says "Location" but shows `label_status`. The form cannot set `process_id`. |
| P6 | `frontend/src/pages/Assembly/Dashboard.tsx:68`, `ClearTag.tsx:26` | `today()` uses `toISOString()`, which is the UTC date. From 00:00 to 06:59 in Thailand, the default filter is yesterday. |
| P7 | `frontend/src/pages/Assembly/ScanTag.tsx:46` | A manual scan sends no `location_name`, so the location becomes null. The real stored procedure does the same. |
| S1 | `backend/scripts/setup_dev_database.sql:783-784` | The seed maps gr_f1 to process 1 and mc_f1 to process 2. The mock, Bruno and README map both to process 2. |

## Decisions

| Item | Decision |
|---|---|
| P1 selector | List **processes** (not statuses) with `can_clear_tag = 1`. Add a code comment: *need to discuss with user again: clear tag by process or location*. |
| P1 flag | New column `tb_master_process.can_clear_tag BIT NOT NULL DEFAULT 0`. |
| P1 backend rule | `Stored_tb_assy_completed` clears only when the lot's current status belongs to a process with `can_clear_tag = 1`. This replaces `status_id != 3`. |
| P1 pre-fill | Take the process from the lot (lot status, then that status's process), and lock it. A lot whose process cannot be cleared is blocked. |
| P2 | Option B: type options come from `/status`, filtered to statuses that have a scan endpoint (the `SCAN_CONFIG` keys). |
| M3 | Option A: keep the fixture static, but align its part/WOS pairs with `lots`. |

**Open question (task 3):** should the GAUGING seed be `can_clear_tag = 1`? If yes, lots at Gauging Room F1 can be cleared too. Today only MC Gauging F1 can be cleared.

## Tasks

| # | Status | Task | Files (about) | Runs in |
|---|---|---|---|---|
| 1 | `[x]` | **M1 + M2 + M4, lot fixtures.** Done: one part per WOS (5 lots each), today's rows end at "now", 5 cleared today from 2 processes (`lots.ts:5-75`, 3 new tests in `db.test.ts`). One part per WOS. Today's timestamps stay in the past, ending at "now". More cleared rows today, with remarks from different processes. | `mocks/fixtures/lots.ts`, mock tests that assert totals | Main (Sonnet 5, medium) |
| 2 | `[x]` | **M3, Daily Inventory fixture.** Done: pairs now W000100-104 with the lots' parts (`dailyInventory.ts:5-14`), new test in `dashboard.test.ts`. Static list, but with the same part/WOS pairs as `lots`. | `mocks/fixtures/dailyInventory.ts`, `dailyInventory.test.ts` if affected | Main (Sonnet 5, medium) |
| 3 | `[ ]` | **P1a, DB.** Add the `can_clear_tag` column. Change `Stored_tb_assy_completed` to the new rule. Up and down SQL, plus the dev seed. Show the SQL and wait for approval. Never run it. | `backend/backup_DB_SP/alter_process_can_clear_tag.sql`, `.down.sql`, `backend/scripts/setup_dev_database.sql` | Main (Opus 5.5, high) |
| 4 | `[ ]` | **P1b, backend.** Process select, insert and update read and write `can_clear_tag`. Add unit tests and update the Bruno Process requests. | `backend/services/masterService.js`, `backend/test/unit/masterService.test.js`, `bruno/AYT-RFID/Process - {List,Create,Update}.yml` | Main (Sonnet 5, medium) |
| 5 | `[ ]` | **P1c, types, mock and admin UI.** `Process.can_clear_tag` in the types and mock fixture. The mock `/completed` follows the new rule. ProcessTab gets a checkbox. | `types/api.ts`, `mocks/fixtures/master.ts`, `mocks/handlers/admin.ts`, `mocks/handlers/lots.ts`, `Management/ProcessTab.tsx` | Main (Sonnet 5, medium) |
| 6 | `[ ]` | **P1d, Clear Tag page.** The selector lists clearable processes, is pre-filled from the lot and locked. Non-clearable lots are blocked. The remark becomes `[FROM: <process_name>]`. Add the discussion comment. | `pages/Assembly/ClearTag.tsx` | Main (Sonnet 5, medium) |
| 7 | `[ ]` | **P2 + P3 + P4, Reader Config.** Type options come from `/status`, filtered by the `SCAN_CONFIG` keys. Connection status matched by `index`. `colSpan` = 7. | `pages/Assembly/ReaderConfig.tsx`, maybe `SCAN_CONFIG` moved to a shared file | Main (Sonnet 5, high) |
| 8 | `[ ]` | **P5 header + P6.** Rename the "Location" header to "Label". `today()` uses the local date. | `Management/StatusTab.tsx`, `Dashboard.tsx`, `ClearTag.tsx` | Main (Haiku 4.5, low) |
| — | `[-] DEFERRED` | P5: `process_id` field in the Status form | An earlier decision (plan Task 12) keeps it null. Needs a new decision to resume. |
| — | `[-] DEFERRED` | P7: manual scan clears the location | Backend and service issue, not mock data. Needs a rule for what location a manual scan sets. |
| — | `[-] DEFERRED` | S1: seed process mapping mismatch | Can be folded into task 3 if approved. |

## Deferred and blocked

- `[-] DEFERRED` P5 `process_id` in the Status form: needs a new decision.
- `[-] DEFERRED` P7 location on manual scan: needs a business rule.
- `[-] DEFERRED` S1 seed mismatch: can join task 3.
