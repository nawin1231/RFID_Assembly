import type { DailyInventoryRow } from '../../types/api';

export interface DailyInventoryGroup {
    part_no: string;
    mc_nos: string[];
    wos: { wos: string; qty: number }[];
}

// One group per part: machines listed once, qty summed per WOS across machines.
export const groupDailyInventoryByPart = (rows: DailyInventoryRow[]): DailyInventoryGroup[] => {
    const byPart = new Map<string, { mcs: Set<string>; wos: Map<string, number> }>();
    for (const r of rows) {
        const part = byPart.get(r.part_no) ?? { mcs: new Set<string>(), wos: new Map<string, number>() };
        part.mcs.add(r.mc_no);
        part.wos.set(r.wos, (part.wos.get(r.wos) ?? 0) + r.qty);
        byPart.set(r.part_no, part);
    }
    return [...byPart.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([part_no, { mcs, wos }]) => ({
            part_no,
            mc_nos: [...mcs].sort(),
            wos: [...wos.entries()]
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([w, qty]) => ({ wos: w, qty })),
        }));
};
