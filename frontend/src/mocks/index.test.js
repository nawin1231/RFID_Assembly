import axios from 'axios';

beforeEach(() => {
    sessionStorage.clear();
    process.env.REACT_APP_MOCK_LATENCY = '0';
    jest.resetModules();
});

afterEach(() => {
    delete process.env.REACT_APP_MOCK_LATENCY;
});

test('installs the adapter and seeds the admin session', async () => {
    const { installMockMode } = require('./index');
    const api = axios.create({ baseURL: 'http://localhost:5001/api/assembly' });
    installMockMode(api);

    const res = await api.get('/dashboard');
    expect(res.data.summary.total_qty).toBeGreaterThan(0);
    expect(JSON.parse(sessionStorage.getItem('assy_user')).position).toBe('admin');
});

test('a mutation through the API shows on the dashboard', async () => {
    const { installMockMode } = require('./index');
    const api = axios.create({ baseURL: 'http://localhost:5001/api/assembly' });
    installMockMode(api);

    const before = (await api.get('/dashboard')).data.summary.bf_issue;
    const lot = (await api.get('/lot/DEMO000040')).data;
    await api.post('/register-tag', { ...lot, tag_id: 'INSTALLTEST' });
    const after = (await api.get('/dashboard')).data.summary.bf_issue;
    expect(after).toBe(before + lot.qty);
});
