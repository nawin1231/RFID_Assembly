const loadApi = (mockFlag) => {
    if (mockFlag === undefined) delete process.env.REACT_APP_MOCK;
    else process.env.REACT_APP_MOCK = mockFlag;
    process.env.REACT_APP_MOCK_LATENCY = '0';
    jest.resetModules();
    return require('./instance').backendApi;
};

afterEach(() => {
    delete process.env.REACT_APP_MOCK;
    delete process.env.REACT_APP_MOCK_LATENCY;
    sessionStorage.clear();
});

test('uses the mock adapter when REACT_APP_MOCK is "true"', async () => {
    const api = loadApi('true');
    expect(typeof api.defaults.adapter).toBe('function');
    expect((await api.get('/status')).data.length).toBeGreaterThan(0);
});

test.each([undefined, 'false', '1'])('keeps the real adapter when REACT_APP_MOCK is %p', (flag) => {
    const api = loadApi(flag);
    expect(Array.isArray(api.defaults.adapter)).toBe(true);
    expect(sessionStorage.getItem('assy_user')).toBeNull();
});
