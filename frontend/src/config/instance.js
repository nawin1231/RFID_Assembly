import axios from 'axios';
import API from './constance';

export const backendApi = axios.create({
    baseURL: API.BACKEND,
    headers: { 'Content-Type': 'application/json' },
});

// Inline env checks + require() let the production build drop the whole mocks tree.
// NODE_ENV is always defined at build time, so the drop does not depend on a local .env file.
if (process.env.NODE_ENV !== 'production' && process.env.REACT_APP_MOCK === 'true') {
    require('../mocks').installMockMode(backendApi);
}
