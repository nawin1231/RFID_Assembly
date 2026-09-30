import type { DailyInventoryRow } from '../../types/api';

// W000201 runs on two machines, so the UI must sum its qty into one WOS row.
export const buildDailyInventory = (): DailyInventoryRow[] => [
    { mc_no: 'MC-01', part_no: '6204ZZCM', wos: 'W000101', qty: 999 },
    { mc_no: 'MC-02', part_no: '6204ZZCM', wos: 'W000102', qty: 999 },
    { mc_no: 'MC-03', part_no: '6204ZZCM', wos: 'W000103', qty: 999 },
    { mc_no: 'MC-04', part_no: '6204ZZCM', wos: 'W000101', qty: 500 },
    { mc_no: 'MC-05', part_no: '6204ZZCM', wos: 'W000102', qty: 250 },
    { mc_no: 'MC-06', part_no: '6205DDUCM', wos: 'W000201', qty: 1200 },
    { mc_no: 'MC-07', part_no: '6205DDUCM', wos: 'W000201', qty: 800 },
    { mc_no: 'MC-07', part_no: '6205DDUCM', wos: 'W000202', qty: 640 },
    { mc_no: 'MC-08', part_no: '6301ZZCM', wos: 'W000301', qty: 360 },
    { mc_no: 'MC-09', part_no: '6003VVCM', wos: 'W000401', qty: 720 },
    { mc_no: 'MC-09', part_no: '6003VVCM', wos: 'W000402', qty: 480 },
    { mc_no: 'MC-10', part_no: '6003VVCM', wos: 'W000403', qty: 300 },
    { mc_no: 'MC-10', part_no: '6003VVCM', wos: 'W000404', qty: 150 },
];
