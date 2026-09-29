const COMPLETED = 4;
const MAX_ROWS = 200;

const sumQty = (lots) => lots.reduce((sum, l) => sum + (l.qty || 0), 0);
const dateOf = (timestamp) => timestamp.slice(0, 10);

// SQL LIKE '%x%' under the default case-insensitive collation; NULL never matches.
const contains = (value, needle) =>
    !needle || (value != null && String(value).toUpperCase().includes(String(needle).toUpperCase()));

const matchesFilter = (lot, q) =>
    (!q.date_from || dateOf(lot.created_at) >= q.date_from)
    && (!q.date_to || dateOf(lot.created_at) <= q.date_to)
    && contains(lot.brg_type, q.brg_type)
    && contains(lot.wos, q.wos)
    && contains(lot.lot_no, q.lot_no)
    && (!q.status_id || lot.status_id === Number(q.status_id))
    && contains(lot.location_name, q.location_name);

const activeLots = (db) => db.lots.filter((l) => l.status_id !== COMPLETED);

const TOP_N = 5;

const withLabel = (db) => (lot) => ({
    tag_id: lot.tag_id, lot_no: lot.lot_no, wos: lot.wos, qty: lot.qty, status_id: lot.status_id,
    label_status: db.statuses.find((s) => s.id === lot.status_id)?.label_status ?? null,
    brg_type: lot.brg_type, spec: lot.spec, location_name: lot.location_name, machine_no: lot.machine_no,
    created_at: lot.created_at, updated_at: lot.updated_at,
});

// Counts lots, not pieces (see Bruno "Dashboard - Summary").
const topBearingTypes = (lots) => {
    const counts = new Map();
    lots.forEach((l) => counts.set(l.brg_type, (counts.get(l.brg_type) ?? 0) + 1));
    return [...counts]
        .map(([brg_type, total_qty]) => ({ brg_type, total_qty }))
        .sort((a, b) => b.total_qty - a.total_qty || a.brg_type.localeCompare(b.brg_type))
        .slice(0, TOP_N);
};

export const dashboardRoutes = (db) => [
    {
        method: 'GET',
        path: '/dashboard',
        handler: ({ query }) => {
            const lots = db.lots.filter((l) => matchesFilter(l, query));
            const qtyAt = (statusId) => sumQty(lots.filter((l) => l.status_id === statusId));
            const active = lots.filter((l) => l.status_id !== COMPLETED);
            return {
                data: {
                    summary: {
                        total_qty: sumQty(active),
                        bf_issue: qtyAt(1),
                        gr_f1: qtyAt(2),
                        mc_f1: qtyAt(3),
                    },
                    top5: topBearingTypes(active),
                    lots: [...active]
                        .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
                        .slice(0, MAX_ROWS)
                        .map(withLabel(db)),
                },
            };
        },
    },
    {
        method: 'GET',
        path: '/dashboard/process-summary',
        handler: () => {
            const statusIdsOf = (processId) =>
                db.statuses.filter((s) => s.process_id === processId).map((s) => s.id);
            const rows = [...db.processes]
                .sort((a, b) => a.process_code.localeCompare(b.process_code))
                .map((p) => ({
                    process_code: p.process_code,
                    process_name: p.process_name,
                    inventory_qty: sumQty(activeLots(db).filter((l) => statusIdsOf(p.id).includes(l.status_id))),
                }));
            return { data: rows };
        },
    },
    {
        method: 'GET',
        path: '/dashboard/history',
        handler: ({ query }) => {
            const labelOf = (statusId) => db.statuses.find((s) => s.id === statusId)?.label_status ?? null;
            const rows = activeLots(db)
                .filter((l) => matchesFilter(l, query))
                .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
                .slice(0, MAX_ROWS)
                .map((l) => ({ ...l, label_status: labelOf(l.status_id) }));
            return { data: rows };
        },
    },
    {
        method: 'GET',
        path: '/dashboard/locations',
        handler: () => ({
            data: db.readerConfig
                .filter((r) => r.location_name)
                .map((r) => ({ location_name: r.location_name })),
        }),
    },
];
