import type { DailyInventoryRow } from '../../types/api';

export interface DailyInventoryGroup {
    part_no: string;
    wos: string;
    mc_nos: string[];
    qty: number;
}

// Keyed by part + WOS (not part only) so a second WOS for a part shows as its own row instead of being hidden.
export const groupDailyInventory = (rows: DailyInventoryRow[]): DailyInventoryGroup[] => {
    const groups = new Map<string, { part_no: string; wos: string; mcs: Set<string>; qty: number }>();
    for (const r of rows) {
        const key = `${r.part_no}|${r.wos}`;
        const g = groups.get(key) ?? { part_no: r.part_no, wos: r.wos, mcs: new Set<string>(), qty: 0 };
        g.mcs.add(r.mc_no);
        g.qty += r.qty;
        groups.set(key, g);
    }
    return [...groups.values()]
        .sort((a, b) => a.part_no.localeCompare(b.part_no) || a.wos.localeCompare(b.wos))
        .map(({ part_no, wos, mcs, qty }) => ({ part_no, wos, mc_nos: [...mcs].sort(), qty }));
};
