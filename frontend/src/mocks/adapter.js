import { AxiosError } from 'axios';
import { normalizePath, matchRoute } from './router';

const parseBody = (data) => {
    if (typeof data === 'string' && data) return JSON.parse(data);
    return data ?? {};
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const notMocked = (method, path) => {
    const message = `[mock] No mock for ${method} ${path}`;
    console.warn(message);
    return { status: 404, data: { error: 'NO_MOCK', message } };
};

export const createMockAdapter = (routes, latencyMs = 0) => async (config) => {
    const method = config.method.toUpperCase();
    const path = normalizePath(config.url, config.baseURL);
    const match = matchRoute(routes, method, path);
    await wait(latencyMs);

    const { status = 200, data } = match
        ? await match.handler({ params: match.params, query: config.params ?? {}, body: parseBody(config.data) })
        : notMocked(method, path);

    const response = { data, status, statusText: String(status), headers: {}, config, request: {} };
    if (!config.validateStatus || config.validateStatus(status)) return response;
    throw new AxiosError(
        `Request failed with status code ${status}`,
        status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
        config,
        response.request,
        response,
    );
};
