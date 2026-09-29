const ESCAPE_RE = /[.*+?^${}()|[\]\\]/g;

const toPattern = (path) => {
    const names = [];
    const source = path
        .split('/')
        .map((segment) => {
            if (!segment.startsWith(':')) return segment.replace(ESCAPE_RE, '\\$&');
            names.push(segment.slice(1));
            return '([^/]+)';
        })
        .join('/');
    return { regex: new RegExp(`^${source}$`), names };
};

// Pages build URLs from raw scanner input, so a lone '%' can reach us.
const safeDecode = (value) => {
    try { return decodeURIComponent(value); }
    catch { return null; }
};

export const normalizePath = (url = '', baseURL = '') => {
    let path = url;
    if (baseURL && path.startsWith(baseURL)) path = path.slice(baseURL.length);
    path = path.split('?')[0];
    if (!path.startsWith('/')) path = `/${path}`;
    return path.length > 1 ? path.replace(/\/+$/, '') : path;
};

export const matchRoute = (routes, method, path) => {
    const wanted = String(method).toUpperCase();
    for (const route of routes) {
        if (route.method !== wanted) continue;
        const { regex, names } = toPattern(route.path);
        const matched = regex.exec(path);
        if (!matched) continue;
        const values = matched.slice(1).map(safeDecode);
        if (values.includes(null)) continue;
        const params = Object.fromEntries(names.map((name, i) => [name, values[i]]));
        return { handler: route.handler, params };
    }
    return null;
};
