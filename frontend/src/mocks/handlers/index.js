import { authRoutes } from './auth';
import { lotRoutes } from './lots';
import { dashboardRoutes } from './dashboard';
import { clearTagRoutes } from './clearTag';
import { adminRoutes } from './admin';

export const createRoutes = (db) => [
    ...authRoutes(db),
    ...lotRoutes(db),
    ...dashboardRoutes(db),
    ...clearTagRoutes(db),
    ...adminRoutes(db),
];
