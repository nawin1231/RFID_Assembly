# Frontend Mock Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let `frontend/` run standalone with `npm run start:mock` so every page renders realistic data and every interaction works, with no backend, no SQL Server and no RFID readers running.

**Architecture:** All 30 HTTP calls in the app go through the single axios instance in `src/config/instance.js`. In mock mode we swap that instance's **adapter** for a local one that matches the request against a route table, runs an in-memory handler, and resolves/rejects exactly like the real server would. Nothing else in the app knows it is mocked: no page component changes, no new runtime dependency. Mock code is isolated under `src/mocks/` and is dead code whenever `REACT_APP_MOCK !== 'true'`.

**Tech Stack:** React 19.2.7, react-scripts 5.0.1 (CRA), react-router-dom 7.11, axios 1.18.1, Tailwind 3.4, sweetalert2, xlsx. Tests: jest + @testing-library via `react-scripts test`.

**Spec:** No separate spec document. The requirements are captured in "Spec (inlined)" below — decisions confirmed with the requester on 2026-09-14.

## Spec (inlined)

1. Run the whole frontend without the backend, for demoing every page to users.
2. Interception method: **custom axios adapter** on `backendApi` (not MSW, not a local JSON server). Chosen because all calls already funnel through one instance, so pages stay untouched and no dependency is added.
3. Auth: **auto-login as a mock admin** on boot in mock mode, so `Register`, `Management` and `Clear Tag` (all `SecureRoute`-guarded) open without a login step. The real login flow stays intact and `/login` is still mocked, so signing out and back in also works.
4. Target: **dev server only** — `npm run start:mock`. No static/offline build, no router changes.
5. Every route in `src/App.js` must be reachable and populated, including the two `ScanTag` routes and `reader-config`, which the sidebar does not currently link to.
6. Mutations must feel real: registering a tag, scanning, clearing a tag and CRUD in Management all change the in-memory store, and the change is visible on the Dashboard.

## Global Constraints

- No edits to any file under `src/pages/`. Pages must remain byte-identical so real-backend behaviour is unaffected.
- Only three files outside `src/mocks/` are touched: `src/config/instance.js` (adapter wiring), `src/index.js` (session seed), `src/components/Layout/Sidebar.js` (mock-only nav entries). Each edit is guarded by `MOCK_MODE`.
- Default behaviour is unchanged: with `npm start` / `npm run build`, `MOCK_MODE === false` and the adapter is never constructed.
- No new **runtime** dependencies. One devDependency only: `cross-env@^7.0.3` (needed because `REACT_APP_MOCK=true npm start` does not work in PowerShell).
- Mock route paths must match **what the frontend calls**, not what `backend/routes/assembly.js` defines. They diverge: `ScanTag` posts to `/gr_f1` and `/mc_f1`; the backend exposes `/gauging-room-f1` and `/mc-gauging-f1`. Mock the frontend's paths.
- API base URL stays `http://localhost:5001/api/assembly` (`src/config/constance.js`). The adapter strips it; do not change it.
- Handler contract is fixed: `({ params, query, body }) => ({ status?: number, data: any })`, sync or async. `status` defaults to 200.
- Thai UI copy is untouched; fixture strings use the same vocabulary as production data (uppercase lot numbers, part numbers, WOS).
- Test command is `npm test -- --watchAll=false --testPathPattern=<pattern>`. There is no lint script in `package.json`; the build (`npm run build`) is the lint gate per project convention.
- `node_modules/` is currently absent — Task 1 installs it.

## File Structure

| File | Responsibility |
|---|---|
| `src/mocks/config.js` | `MOCK_MODE` / `MOCK_LATENCY_MS` flags read from CRA env |
| `src/mocks/router.js` | Pure path matching: `normalizePath`, `matchRoute` |
| `src/mocks/adapter.js` | `createMockAdapter(routes, latency)` — axios adapter, response/error shaping |
| `src/mocks/session.js` | `seedMockSession()` — auto-login admin into `sessionStorage` |
| `src/mocks/db.js` | Mutable in-memory store + `resetDb()` + `nextId()` |
| `src/mocks/fixtures/*.js` | Seed data, one file per domain |
| `src/mocks/handlers/index.js` | Concatenated route table |
| `src/mocks/handlers/auth.js` | `/login`, `/login/users` CRUD |
| `src/mocks/handlers/dashboard.js` | `/dashboard`, `/dashboard/*` |
| `src/mocks/handlers/lots.js` | `/lot/:lot_no`, `/lot-by-*`, `/register-tag`, `/gr_f1`, `/mc_f1`, `/completed` |
| `src/mocks/handlers/clearTag.js` | `/clear-tag/history`, `/mock-done` CRUD |
| `src/mocks/handlers/admin.js` | `/status` CRUD, `/process` CRUD, `/readers-*` |

---

### Task 1: Mock flag + npm script scaffolding

**Files:**
- Create: `frontend/src/mocks/config.js`
- Create: `frontend/src/mocks/config.test.js`
- Modify: `frontend/package.json` (scripts + devDependencies)
- Delete: `frontend/src/App.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `MOCK_MODE: boolean`, `MOCK_LATENCY_MS: number` from `src/mocks/config.js` (default export absent — named exports only).

- [ ] **Step 1: Install dependencies**

`node_modules/` does not exist yet.

```bash
cd frontend
npm install
npm install --save-dev cross-env@^7.0.3
```

- [ ] **Step 2: Write the failing test**

Create `frontend/src/mocks/config.test.js`:

```js
describe('mock config', () => {
    const ORIGINAL_MOCK = process.env.REACT_APP_MOCK;
    const ORIGINAL_LATENCY = process.env.REACT_APP_MOCK_LATENCY;

    afterEach(() => {
        process.env.REACT_APP_MOCK = ORIGINAL_MOCK;
        process.env.REACT_APP_MOCK_LATENCY = ORIGINAL_LATENCY;
        jest.resetModules();
    });

    test('MOCK_MODE is false when REACT_APP_MOCK is unset', () => {
        delete process.env.REACT_APP_MOCK;
        jest.resetModules();
        expect(require('./config').MOCK_MODE).toBe(false);
    });

    test('MOCK_MODE is true only for the exact string "true"', () => {
        process.env.REACT_APP_MOCK = 'true';
        jest.resetModules();
        expect(require('./config').MOCK_MODE).toBe(true);

        process.env.REACT_APP_MOCK = '1';
        jest.resetModules();
        expect(require('./config').MOCK_MODE).toBe(false);
    });

    test('MOCK_LATENCY_MS defaults to 250 and is overridable', () => {
        delete process.env.REACT_APP_MOCK_LATENCY;
        jest.resetModules();
        expect(require('./config').MOCK_LATENCY_MS).toBe(250);

        process.env.REACT_APP_MOCK_LATENCY = '0';
        jest.resetModules();
        expect(require('./config').MOCK_LATENCY_MS).toBe(0);
    });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- --watchAll=false --testPathPattern=mocks/config`
Expected: FAIL — `Cannot find module './config'`.

- [ ] **Step 4: Write the implementation**

Create `frontend/src/mocks/config.js`:

```js
export const MOCK_MODE = process.env.REACT_APP_MOCK === 'true';

export const MOCK_LATENCY_MS = process.env.REACT_APP_MOCK_LATENCY === undefined
    ? 250
    : Number(process.env.REACT_APP_MOCK_LATENCY);
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- --watchAll=false --testPathPattern=mocks/config`
Expected: PASS, 3 tests.

- [ ] **Step 6: Add the mock start script**

In `frontend/package.json`, add to `"scripts"` (keep the existing four):

```json
"start:mock": "cross-env REACT_APP_MOCK=true react-scripts start"
```

- [ ] **Step 7: Delete the stale CRA boilerplate test**

`src/App.test.js` is the unmodified Create React App sample — it asserts on a "learn react" link that this app has never rendered, so it fails and would mask real failures in every later task.

```bash
rm src/App.test.js
```

- [ ] **Step 8: Verify the whole suite is green**

Run: `npm test -- --watchAll=false`
Expected: PASS, 1 suite, 3 tests, no failures.

- [ ] **Step 9: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/src/mocks/config.js frontend/src/mocks/config.test.js
git add -u frontend/src/App.test.js
git commit -m "chore(frontend): add mock-mode flag and start:mock script"
```

---

### Task 2: Route matcher

**Files:**
- Create: `frontend/src/mocks/router.js`
- Create: `frontend/src/mocks/router.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `normalizePath(url: string, baseURL?: string) => string` — strips `baseURL`, query string and trailing slash; always leading-slashed.
  - `matchRoute(routes: Route[], method: string, path: string) => { handler, params } | null`
  - `Route = { method: 'GET'|'POST'|'PUT'|'DELETE', path: string, handler: Function }`, where `path` may contain `:name` segments.

- [ ] **Step 1: Write the failing test**

Create `frontend/src/mocks/router.test.js`:

```js
import { normalizePath, matchRoute } from './router';

const handler = () => ({ data: 'ok' });
const routes = [
    { method: 'GET', path: '/status', handler },
    { method: 'GET', path: '/lot-by-tag/:tag_id', handler },
    { method: 'PUT', path: '/login/users/:id', handler },
    { method: 'GET', path: '/dashboard/process-summary', handler },
];

describe('normalizePath', () => {
    test('strips the axios baseURL', () => {
        expect(normalizePath('/status', 'http://localhost:5001/api/assembly')).toBe('/status');
        expect(normalizePath('http://localhost:5001/api/assembly/status', 'http://localhost:5001/api/assembly'))
            .toBe('/status');
    });

    test('strips the query string', () => {
        expect(normalizePath('/dashboard/history?date_from=2026-09-14', '')).toBe('/dashboard/history');
    });

    test('strips a trailing slash but keeps root', () => {
        expect(normalizePath('/status/', '')).toBe('/status');
        expect(normalizePath('/', '')).toBe('/');
    });

    test('adds a leading slash', () => {
        expect(normalizePath('status', '')).toBe('/status');
    });
});

describe('matchRoute', () => {
    test('matches a static path', () => {
        expect(matchRoute(routes, 'GET', '/status')).toMatchObject({ params: {} });
    });

    test('extracts named params', () => {
        expect(matchRoute(routes, 'GET', '/lot-by-tag/E2801160').params).toEqual({ tag_id: 'E2801160' });
        expect(matchRoute(routes, 'PUT', '/login/users/7').params).toEqual({ id: '7' });
    });

    test('is method-sensitive', () => {
        expect(matchRoute(routes, 'POST', '/status')).toBeNull();
    });

    test('accepts a lowercase method', () => {
        expect(matchRoute(routes, 'get', '/status')).not.toBeNull();
    });

    test('does not let a param segment swallow a slash', () => {
        expect(matchRoute(routes, 'GET', '/lot-by-tag/AB/CD')).toBeNull();
    });

    test('prefers the static route over a param route regardless of order', () => {
        expect(matchRoute(routes, 'GET', '/dashboard/process-summary')).not.toBeNull();
    });

    test('returns null for an unknown path', () => {
        expect(matchRoute(routes, 'GET', '/nope')).toBeNull();
    });

    test('url-decodes params', () => {
        expect(matchRoute(routes, 'GET', '/lot-by-tag/A%2F1').params).toEqual({ tag_id: 'A/1' });
    });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --watchAll=false --testPathPattern=mocks/router`
Expected: FAIL — `Cannot find module './router'`.

- [ ] **Step 3: Write the implementation**

Create `frontend/src/mocks/router.js`:

```js
const ESCAPE_RE = /[.*+?^${}()|[\]\\]/g;

const toPattern = (path) => {
    const names = [];
    const source = path
        .split('/')
        .map((segment) => {
            if (!segment.startsWith(':')) return segment.replace(ESCAPE_RE, '\\$&');
            names.push(segment.slice(1));
            return '([^/]+)';
        })
        .join('/');
    return { regex: new RegExp(`^${source}$`), names };
};

export const normalizePath = (url = '', baseURL = '') => {
    let path = url;
    if (baseURL && path.startsWith(baseURL)) path = path.slice(baseURL.length);
    path = path.split('?')[0];
    if (!path.startsWith('/')) path = `/${path}`;
    return path.length > 1 ? path.replace(/\/+$/, '') : path;
};

export const matchRoute = (routes, method, path) => {
    const wanted = String(method).toUpperCase();
    for (const route of routes) {
        if (route.method !== wanted) continue;
        const { regex, names } = toPattern(route.path);
        const matched = regex.exec(path);
        if (!matched) continue;
        const params = {};
        names.forEach((name, i) => { params[name] = decodeURIComponent(matched[i + 1]); });
        return { handler: route.handler, params };
    }
    return null;
};
```

Note on "prefers the static route": `matchRoute` returns the **first** route that matches, so within a handler file the static path must be listed before a same-shaped param path. `/dashboard/process-summary` and `/lot-by-tag/:tag_id` do not collide, but keep the ordering rule when adding routes.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- --watchAll=false --testPathPattern=mocks/router`
Expected: PASS, 12 tests.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/mocks/router.js frontend/src/mocks/router.test.js
git commit -m "feat(frontend): add mock route matcher"
```
