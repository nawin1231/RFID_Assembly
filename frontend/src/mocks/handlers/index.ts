import { authRoutes } from './auth';
import { lotRoutes } from './lots';
import { dashboardRoutes } from './dashboard';
import { clearTagRoutes } from './clearTag';
import { adminRoutes } from './admin';
import type { MockDb, Route } from '../types';

// Temporary: lots.js and dashboard.js are still JS (infer method: string). Remove both casts in Task 8.
export const createRoutes = (db: MockDb): Route[] => [
    ...authRoutes(db),
    ...(lotRoutes(db) as Route[]),
    ...(dashboardRoutes(db) as Route[]),
    ...clearTagRoutes(db),
    ...adminRoutes(db),
];
