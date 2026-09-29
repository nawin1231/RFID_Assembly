import { lotRoutes } from './lots';
import { createTestDb, callRoute } from '../testUtils';

let db;
let routes;
beforeEach(() => {
    db = createTestDb();
    routes = lotRoutes(db);
});

const lotAt = (statusId) => db.lots.find((l) => l.status_id === statusId);
const unregistered = () => db.as400Lots.find((a) => !db.lots.some((l) => l.lot_no === a.lot_no));
const post = (path, body) => callRoute(routes, 'POST', path, { body });

describe('lookups', () => {
    test('GET /lot/:lot_no returns the AS400 record', async () => {
        const lot = unregistered();
        const res = await callRoute(routes, 'GET', `/lot/${lot.lot_no}`);
        expect(res.data).toEqual(lot);
    });

    test('GET /lot/:lot_no returns 404 for an unknown lot', async () => {
        expect((await callRoute(routes, 'GET', '/lot/NOPE')).status).toBe(404);
    });

    test('lot-by-lot and lot-by-tag find an active lot', async () => {
        const lot = lotAt(2);
        const byLot = await callRoute(routes, 'GET', `/lot-by-lot/${lot.lot_no}`);
        const byTag = await callRoute(routes, 'GET', `/lot-by-tag/${lot.tag_id}`);
        expect(byLot.data).toEqual(byTag.data);
        expect(byLot.data).toMatchObject({ lot_no: lot.lot_no, tag_id: lot.tag_id, status_id: 2 });
    });

    test('lot-by-lot and lot-by-tag hide completed lots', async () => {
        const lot = lotAt(4);
        expect((await callRoute(routes, 'GET', `/lot-by-lot/${lot.lot_no}`)).data).toEqual({ error: 'LOT_NOT_FOUND' });
        expect((await callRoute(routes, 'GET', `/lot-by-tag/${lot.tag_id}`)).data).toEqual({ error: 'TAG_NOT_FOUND' });
    });
});

describe('unknown lookups', () => {
    test('lot-by-lot returns 404 LOT_NOT_FOUND for an unknown lot', async () => {
        const res = await callRoute(routes, 'GET', '/lot-by-lot/NOPE');
        expect(res).toMatchObject({ status: 404, data: { error: 'LOT_NOT_FOUND' } });
    });

    test('lot-by-tag returns 404 TAG_NOT_FOUND for an unknown tag', async () => {
        const res = await callRoute(routes, 'GET', '/lot-by-tag/NOPE');
        expect(res).toMatchObject({ status: 404, data: { error: 'TAG_NOT_FOUND' } });
    });
});

describe('POST /register-tag', () => {
    test('registers a new lot at Before Issue, stamped with the clock', async () => {
        const lot = unregistered();
        expect((await post('/register-tag', { ...lot, tag_id: 'NEWTAG1' })).data).toEqual({ result: 'OK' });
        expect(db.lots.find((l) => l.lot_no === lot.lot_no)).toMatchObject({
            tag_id: 'NEWTAG1', status_id: 1, created_at: '2026-09-29T10:00:00.000Z',
        });
    });

    test('rejects a lot that is already registered', async () => {
        const lot = lotAt(1);
        expect((await post('/register-tag', { ...lot, tag_id: 'NEWTAG2' })).data.result).toBe('LOT_ALREADY_EXISTS');
    });

    test('rejects a tag used by an active lot', async () => {
        expect((await post('/register-tag', { ...unregistered(), tag_id: lotAt(1).tag_id })).data.result).toBe('TAG_IN_USE');
    });

    test('allows reusing the tag of a completed lot', async () => {
        expect((await post('/register-tag', { ...unregistered(), tag_id: lotAt(4).tag_id })).data.result).toBe('OK');
    });
});

describe('scan flow', () => {
    test('gr_f1 moves Before Issue to Gauging Room F1', async () => {
        const lot = lotAt(1);
        expect((await post('/gr_f1', { tag_id: lot.tag_id })).data.result).toBe('OK');
        expect(lot).toMatchObject({ status_id: 2, updated_at: '2026-09-29T10:00:00.000Z' });
    });

    test('mc_f1 before gr_f1 is INVALID_PROCESS and changes nothing', async () => {
        const lot = lotAt(1);
        expect((await post('/mc_f1', { tag_id: lot.tag_id })).data.result).toBe('INVALID_PROCESS');
        expect(lot.status_id).toBe(1);
    });

    test('an unknown tag is TAG_NOT_FOUND', async () => {
        expect((await post('/gr_f1', { tag_id: 'NOPE' })).data.result).toBe('TAG_NOT_FOUND');
    });

    test('gr_f1 stores the reader location_name', async () => {
        const lot = lotAt(1);
        await post('/gr_f1', { tag_id: lot.tag_id, location_name: 'GAUGING ROOM F1' });
        expect(lot.location_name).toBe('GAUGING ROOM F1');
    });

    test('a scan without location_name clears it, like the real SP', async () => {
        const lot = lotAt(2);
        await post('/mc_f1', { tag_id: lot.tag_id });
        expect(lot.location_name).toBeNull();
    });
});

describe('POST /completed', () => {
    test('clears a lot at MC Gauging F1', async () => {
        const lot = lotAt(3);
        const res = await post('/completed', { lot_no: lot.lot_no, remark: '[FROM: MC Gauging F1]', emp_id: 'MOCK001' });
        expect(res.data.result).toBe('OK');
        expect(lot).toMatchObject({
            status_id: 4, cleared_at: '2026-09-29T10:00:00.000Z', remark: '[FROM: MC Gauging F1]', emp_id: 'MOCK001',
        });
    });

    test('stores machine_no on the cleared lot', async () => {
        const lot = lotAt(3);
        await post('/completed', { lot_no: lot.lot_no, machine_no: 'MC-07' });
        expect(lot.machine_no).toBe('MC-07');
    });

    test('rejects a lot not yet at MC Gauging F1', async () => {
        expect((await post('/completed', { lot_no: lotAt(1).lot_no })).data.result).toBe('INVALID_PROCESS');
    });

    test('rejects an unknown lot', async () => {
        expect((await post('/completed', { lot_no: 'NOPE' })).data.result).toBe('LOT_NOT_FOUND');
    });
});

test('full flow: register, scan GR, scan MC, clear', async () => {
    const lot = unregistered();
    await post('/register-tag', { ...lot, tag_id: 'FLOWTAG' });
    await post('/gr_f1', { tag_id: 'FLOWTAG' });
    await post('/mc_f1', { tag_id: 'FLOWTAG' });
    expect((await post('/completed', { lot_no: lot.lot_no, emp_id: 'MOCK001' })).data.result).toBe('OK');
    expect((await callRoute(routes, 'GET', '/lot-by-tag/FLOWTAG')).status).toBe(404);
});
