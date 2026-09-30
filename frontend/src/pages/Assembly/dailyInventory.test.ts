import { groupDailyInventoryByPart } from './dailyInventory';
import type { DailyInventoryRow } from '../../types/api';

const row = (mc_no: string, part_no: string, wos: string, qty: number): DailyInventoryRow => ({ mc_no, part_no, wos, qty });

describe('groupDailyInventoryByPart', () => {
    it('returns an empty list for no rows', () => {
        expect(groupDailyInventoryByPart([])).toEqual([]);
    });

    it('sums qty for a WOS that runs on several machines', () => {
        const groups = groupDailyInventoryByPart([
            row('MC-06', 'P1', 'W1', 1200),
            row('MC-07', 'P1', 'W1', 800),
        ]);
        expect(groups).toEqual([{ part_no: 'P1', mc_nos: ['MC-06', 'MC-07'], wos: [{ wos: 'W1', qty: 2000 }] }]);
    });

    it('lists each machine once, sorted', () => {
        const groups = groupDailyInventoryByPart([
            row('MC-07', 'P1', 'W2', 1),
            row('MC-06', 'P1', 'W1', 1),
            row('MC-07', 'P1', 'W1', 1),
        ]);
        expect(groups[0].mc_nos).toEqual(['MC-06', 'MC-07']);
    });

    it('sorts parts and the WOS rows inside each part', () => {
        const groups = groupDailyInventoryByPart([
            row('MC-02', 'P2', 'W9', 1),
            row('MC-01', 'P1', 'W3', 1),
            row('MC-01', 'P1', 'W2', 1),
        ]);
        expect(groups.map(g => g.part_no)).toEqual(['P1', 'P2']);
        expect(groups[0].wos.map(w => w.wos)).toEqual(['W2', 'W3']);
    });

    it('keeps the same WOS under different parts apart', () => {
        const groups = groupDailyInventoryByPart([
            row('MC-01', 'P1', 'W1', 5),
            row('MC-02', 'P2', 'W1', 7),
        ]);
        expect(groups.map(g => g.wos)).toEqual([[{ wos: 'W1', qty: 5 }], [{ wos: 'W1', qty: 7 }]]);
    });
});
