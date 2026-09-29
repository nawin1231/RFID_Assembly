import { createDb } from './db';
import { createRoutes } from './handlers';
import { createMockAdapter } from './adapter';
import { seedMockSession } from './session';
import { MOCK_LATENCY_MS } from './config';

export const installMockMode = (api) => {
    const db = createDb();
    api.defaults.adapter = createMockAdapter(createRoutes(db), MOCK_LATENCY_MS);
    seedMockSession(db.users);
};
