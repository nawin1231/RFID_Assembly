import { nextId } from '../db';

const OK = { data: { result: 'OK' } };

// The real API returns SQL Server's error text as `result` with HTTP 200.
const fkConflict = (constraint) => ({
    data: { result: `The DELETE statement conflicted with the REFERENCE constraint "${constraint}".` },
});

const byId = (rows, id) => rows.find((row) => row.id === Number(id));

export const adminRoutes = (db) => [
    {
        method: 'GET',
        path: '/status',
        handler: () => ({
            data: db.statuses.map((s) => {
                const process = byId(db.processes, s.process_id);
                return { ...s, process_code: process?.process_code ?? null, process_name: process?.process_name ?? null };
            }),
        }),
    },
    {
        method: 'POST',
        path: '/status',
        handler: ({ body }) => {
            db.statuses.push({
                id: nextId(db.statuses), status: body.status, label_status: body.label_status,
                process_id: body.process_id ?? null,
            });
            return OK;
        },
    },
    {
        method: 'PUT',
        path: '/status/:id',
        handler: ({ params, body }) => {
            const status = byId(db.statuses, params.id);
            if (status) {
                Object.assign(status, {
                    status: body.status, label_status: body.label_status, process_id: body.process_id ?? null,
                });
            }
            return OK;
        },
    },
    {
        method: 'DELETE',
        path: '/status/:id',
        handler: ({ params }) => {
            const id = Number(params.id);
            if (db.lots.some((l) => l.status_id === id)) return fkConflict('FK_assy_lot_status');
            db.statuses = db.statuses.filter((s) => s.id !== id);
            return OK;
        },
    },
    {
        method: 'GET',
        path: '/process',
        handler: () => ({
            data: [...db.processes].sort((a, b) => a.process_code.localeCompare(b.process_code)),
        }),
    },
    {
        method: 'POST',
        path: '/process',
        handler: ({ body }) => {
            db.processes.push({
                id: nextId(db.processes), process_code: body.process_code, process_name: body.process_name,
            });
            return OK;
        },
    },
    {
        method: 'PUT',
        path: '/process/:id',
        handler: ({ params, body }) => {
            const process = byId(db.processes, params.id);
            if (process) Object.assign(process, { process_code: body.process_code, process_name: body.process_name });
            return OK;
        },
    },
    {
        method: 'DELETE',
        path: '/process/:id',
        handler: ({ params }) => {
            const id = Number(params.id);
            if (db.statuses.some((s) => s.process_id === id)) return fkConflict('FK_status_process');
            db.processes = db.processes.filter((p) => p.id !== id);
            return OK;
        },
    },
    {
        method: 'GET',
        path: '/readers-config',
        handler: () => ({ data: db.readerConfig.map((r) => ({ ...r })) }),
    },
    {
        method: 'PUT',
        path: '/readers-config',
        handler: ({ body }) => {
            db.readerConfig = body;
            return OK;
        },
    },
    {
        method: 'GET',
        path: '/readers-status',
        handler: () => ({
            data: {
                readers: db.readerConfig.map((r, index) => ({ index, type: r.type, ip: r.ip, connected: Boolean(r.enabled) })),
            },
        }),
    },
    { method: 'POST', path: '/readers-restart', handler: () => OK },
];
