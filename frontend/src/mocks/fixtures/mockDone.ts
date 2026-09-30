import { daysAgo } from '../time';

export const buildMockDone = (today) => [
    { id: 1, lot_no: 'DEMO000003', created_at: daysAgo(today, 0, 9, 15) },
    { id: 2, lot_no: 'DEMO000010', created_at: daysAgo(today, 1, 10) },
];
