import { createDb } from './db';
import { createRoutes } from './handlers';
import { createMockAdapter } from './adapter';
import { seedMockSession } from './session';
import { MOCK_LATENCY_MS } from './config';
import type { AxiosInstance } from 'axios';
import type { Route } from './types';

export const installMockMode = (api: AxiosInstance): void => {
    const db = createDb();
    // Temporary: handlers/index.js is still JS (infers method: string). Remove in Task 7.
    api.defaults.adapter = createMockAdapter(createRoutes(db) as Route[], MOCK_LATENCY_MS);
    seedMockSession(db.users);
};
