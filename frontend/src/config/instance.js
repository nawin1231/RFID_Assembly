import axios from 'axios';
import API from './constance';

export const backendApi = axios.create({
    baseURL: API.BACKEND,
    headers: { 'Content-Type': 'application/json' },
});

// Inline env check + require() lets the production build drop the whole mocks tree.
if (process.env.REACT_APP_MOCK === 'true') {
    require('../mocks').installMockMode(backendApi);
}
