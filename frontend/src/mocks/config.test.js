import { vi } from 'vitest';

describe('mock config', () => {
    afterEach(() => {
        vi.resetModules();
    });

    test('MOCK_LATENCY_MS defaults to 250', async () => {
        vi.stubEnv('REACT_APP_MOCK_LATENCY', undefined);
        expect((await import('./config')).MOCK_LATENCY_MS).toBe(250);
    });

    test('MOCK_LATENCY_MS reads REACT_APP_MOCK_LATENCY, including 0', async () => {
        vi.stubEnv('REACT_APP_MOCK_LATENCY', '0');
        expect((await import('./config')).MOCK_LATENCY_MS).toBe(0);
    });
});
