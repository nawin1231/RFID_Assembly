import { nextId } from '../db';

const COMPLETED = 4;
const MAX_ROWS = 200;

const newestFirst = (key) => (a, b) => b[key].localeCompare(a[key]);
const result = (code) => ({ data: { result: code } });

const historyRow = ({ lot_no, tag_id, emp_id, remark, cleared_at, updated_at, brg_type, spec }) =>
    ({ lot_no, tag_id, emp_id, remark, cleared_at, updated_at, brg_type, spec });

export const clearTagRoutes = (db) => [
    {
        method: 'GET',
        path: '/clear-tag/history',
        handler: ({ query }) => {
            const rows = db.lots
                .filter((l) => l.status_id === COMPLETED)
                .filter((l) => !query.date_from || l.cleared_at.slice(0, 10) >= query.date_from)
                .filter((l) => !query.date_to || l.cleared_at.slice(0, 10) <= query.date_to)
                .sort(newestFirst('cleared_at'))
                .slice(0, MAX_ROWS)
                .map(historyRow);
            return { data: rows };
        },
    },
    {
        method: 'GET',
        path: '/mock-done',
        handler: () => ({ data: [...db.mockDone].sort(newestFirst('created_at')) }),
    },
    {
        method: 'POST',
        path: '/mock-done',
        handler: ({ body }) => {
            if (db.mockDone.some((m) => m.lot_no === body.lot_no)) return result('ALREADY_EXISTS');
            db.mockDone.push({ id: nextId(db.mockDone), lot_no: body.lot_no, created_at: db.now() });
            return result('OK');
        },
    },
    {
        method: 'DELETE',
        path: '/mock-done/:lot_no',
        handler: ({ params }) => {
            const before = db.mockDone.length;
            db.mockDone = db.mockDone.filter((m) => m.lot_no !== params.lot_no);
            return result(db.mockDone.length < before ? 'OK' : 'NOT_FOUND');
        },
    },
];
