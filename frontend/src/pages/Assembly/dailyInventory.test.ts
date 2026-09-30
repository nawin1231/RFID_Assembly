import { groupDailyInventory } from './dailyInventory';
import type { DailyInventoryRow } from '../../types/api';

const row = (mc_no: string, part_no: string, wos: string, qty: number): DailyInventoryRow => ({ mc_no, part_no, wos, qty });

describe('groupDailyInventory', () => {
    it('returns an empty list for no rows', () => {
        expect(groupDailyInventory([])).toEqual([]);
    });

    it('makes one row per part with its machines and summed qty', () => {
        const groups = groupDailyInventory([
            row('MC-06', 'P1', 'W1', 1200),
            row('MC-07', 'P1', 'W1', 800),
        ]);
        expect(groups).toEqual([{ part_no: 'P1', wos: 'W1', mc_nos: ['MC-06', 'MC-07'], qty: 2000 }]);
    });

    it('lists each machine once, sorted', () => {
        const groups = groupDailyInventory([
            row('MC-07', 'P1', 'W1', 1),
            row('MC-06', 'P1', 'W1', 1),
            row('MC-07', 'P1', 'W1', 1),
        ]);
        expect(groups[0].mc_nos).toEqual(['MC-06', 'MC-07']);
    });

    it('sorts by part, then WOS', () => {
        const groups = groupDailyInventory([
            row('MC-02', 'P2', 'W9', 1),
            row('MC-01', 'P1', 'W3', 1),
            row('MC-01', 'P1', 'W2', 1),
        ]);
        expect(groups.map(g => [g.part_no, g.wos])).toEqual([['P1', 'W2'], ['P1', 'W3'], ['P2', 'W9']]);
    });

    it('keeps two WOS of one part as two rows instead of hiding one', () => {
        const groups = groupDailyInventory([
            row('MC-01', 'P1', 'W1', 5),
            row('MC-02', 'P1', 'W2', 7),
        ]);
        expect(groups.map(g => g.qty)).toEqual([5, 7]);
    });
});
