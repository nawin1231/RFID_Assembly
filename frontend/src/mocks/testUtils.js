import { createDb } from './db';
import { matchRoute } from './router';

export const FIXED_NOW = new Date(2026, 8, 29, 10, 0, 0);

export const createTestDb = () => createDb({ now: () => FIXED_NOW });

export const callRoute = async (routes, method, path, { query = {}, body = {} } = {}) => {
    const match = matchRoute(routes, method, path);
    if (!match) throw new Error(`No route for ${method} ${path}`);
    const { status = 200, data } = await match.handler({ params: match.params, query, body });
    return { status, data };
};
