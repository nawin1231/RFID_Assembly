import { daysAgo } from '../time';

const PARTS = [
    { brg_type: '6204ZZCM', spec: 'NS7S' },
    { brg_type: '6205DDUCM', spec: 'AV2S' },
    { brg_type: '6301ZZCM', spec: 'E' },
    { brg_type: '6003VVCM', spec: 'NS7S' },
];

const REGISTERED = 32;
const UNREGISTERED = 8;

// Repeating cycle so every dashboard card, and the Clear Tag history, has rows.
const STATUS_CYCLE = [1, 1, 2, 2, 3, 3, 4];
const LOCATION_BY_STATUS = { 1: null, 2: 'GAUGING ROOM F1', 3: 'MC GAUGING F1', 4: 'MC GAUGING F1' };

const catalogLot = (n) => {
    const part = PARTS[n % PARTS.length];
    return {
        lot_no: `DEMO${String(n).padStart(6, '0')}`,
        wos: `W${String(100 + Math.floor(n / 4)).padStart(6, '0')}`,
        brg_type: part.brg_type,
        spec: part.spec,
        qty: 100 + (n % 5) * 50,
    };
};

export const buildAs400Lots = () =>
    Array.from({ length: REGISTERED + UNREGISTERED }, (_, i) => catalogLot(i + 1));

export const buildLots = (today) =>
    Array.from({ length: REGISTERED }, (_, i) => {
        const statusId = STATUS_CYCLE[i % STATUS_CYCLE.length];
        const day = i % 3;
        const createdAt = daysAgo(today, day, 7 + (i % 8));
        const updatedAt = daysAgo(today, day, 8 + (i % 8), 30);
        const cleared = statusId === 4;
        return {
            ...catalogLot(i + 1),
            tag_id: `E2801160000${String(i + 1).padStart(5, '0')}`,
            status_id: statusId,
            location_name: LOCATION_BY_STATUS[statusId],
            machine_no: null,
            emp_id: cleared ? 'MOCK001' : null,
            remark: cleared ? '[FROM: MC Gauging F1]' : null,
            cleared_at: cleared ? updatedAt : null,
            created_at: createdAt,
            updated_at: updatedAt,
        };
    });
