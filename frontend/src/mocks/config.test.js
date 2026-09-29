const restoreEnv = (key, value) => {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
};

describe('mock config', () => {
    const ORIGINAL_LATENCY = process.env.REACT_APP_MOCK_LATENCY;

    afterEach(() => {
        restoreEnv('REACT_APP_MOCK_LATENCY', ORIGINAL_LATENCY);
        jest.resetModules();
    });

    test('MOCK_LATENCY_MS defaults to 250', () => {
        delete process.env.REACT_APP_MOCK_LATENCY;
        jest.resetModules();
        expect(require('./config').MOCK_LATENCY_MS).toBe(250);
    });

    test('MOCK_LATENCY_MS reads REACT_APP_MOCK_LATENCY, including 0', () => {
        process.env.REACT_APP_MOCK_LATENCY = '0';
        jest.resetModules();
        expect(require('./config').MOCK_LATENCY_MS).toBe(0);
    });
});
