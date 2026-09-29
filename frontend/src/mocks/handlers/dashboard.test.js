import { dashboardRoutes } from './dashboard';
import { createTestDb, callRoute } from '../testUtils';

let db;
let routes;
beforeEach(() => {
    db = createTestDb();
    routes = dashboardRoutes(db);
});

const get = async (path, query) => (await callRoute(routes, 'GET', path, { query })).data;

describe('GET /dashboard', () => {
    test('total_qty is the sum of the three active steps', async () => {
        const { summary } = await get('/dashboard');
        expect(summary.total_qty).toBe(summary.bf_issue + summary.gr_f1 + summary.mc_f1);
        expect(summary.bf_issue).toBeGreaterThan(0);
    });

    test('status_id filter keeps only that step, sent as a string', async () => {
        const { summary } = await get('/dashboard', { status_id: '2' });
        expect(summary.gr_f1).toBeGreaterThan(0);
        expect(summary).toMatchObject({ bf_issue: 0, mc_f1: 0, total_qty: summary.gr_f1 });
    });

    test('brg_type and date filters narrow the totals', async () => {
        const all = (await get('/dashboard')).summary;
        const none = (await get('/dashboard', { brg_type: 'NO-SUCH-PART' })).summary;
        const past = (await get('/dashboard', { date_to: '2000-01-01' })).summary;
        expect(all.total_qty).toBeGreaterThan(0);
        expect(none.total_qty).toBe(0);
        expect(past.total_qty).toBe(0);
    });

    test('reflects a change in the store', async () => {
        const before = (await get('/dashboard')).summary;
        db.lots.find((l) => l.status_id === 1).status_id = 2;
        const after = (await get('/dashboard')).summary;
        expect(after.bf_issue).toBeLessThan(before.bf_issue);
        expect(after.gr_f1).toBeGreaterThan(before.gr_f1);
        expect(after.total_qty).toBe(before.total_qty);
    });
});

describe('GET /dashboard/process-summary', () => {
    test('is ordered by process_code and totals the active inventory', async () => {
        const rows = await get('/dashboard/process-summary');
        expect(rows.map((r) => r.process_code)).toEqual(['1400', '1500']);
        const total = rows.reduce((sum, r) => sum + r.inventory_qty, 0);
        expect(total).toBe((await get('/dashboard')).summary.total_qty);
    });
});

describe('GET /dashboard/history', () => {
    test('the default "today" filter returns rows, all active and created today', async () => {
        const rows = await get('/dashboard/history', { date_from: '2026-09-29', date_to: '2026-09-29' });
        expect(rows.length).toBeGreaterThan(0);
        rows.forEach((r) => {
            expect(r.created_at.startsWith('2026-09-29')).toBe(true);
            expect(r.status_id).not.toBe(4);
        });
    });

    test('filters status_id sent as a string', async () => {
        const rows = await get('/dashboard/history', { status_id: '2' });
        expect(rows.length).toBeGreaterThan(0);
        rows.forEach((r) => expect(r.status_id).toBe(2));
    });

    test('matches part numbers case-insensitively and partially', async () => {
        const rows = await get('/dashboard/history', { brg_type: '6204zz' });
        expect(rows.length).toBeGreaterThan(0);
        rows.forEach((r) => expect(r.brg_type).toBe('6204ZZCM'));
    });

    test('a location filter excludes lots with no location', async () => {
        const rows = await get('/dashboard/history', { location_name: 'GAUGING ROOM F1' });
        expect(rows.length).toBeGreaterThan(0);
        rows.forEach((r) => expect(r.location_name).toBe('GAUGING ROOM F1'));
    });

    test('rows carry label_status and are newest-updated first', async () => {
        const rows = await get('/dashboard/history');
        expect(rows[0].label_status).toBeTruthy();
        const updated = rows.map((r) => r.updated_at);
        expect(updated).toEqual([...updated].sort().reverse());
    });
});

describe('GET /dashboard/locations', () => {
    test('lists reader locations', async () => {
        expect(await get('/dashboard/locations')).toEqual([
            { location_name: 'GAUGING ROOM F1' },
            { location_name: 'MC GAUGING F1' },
        ]);
    });
});
